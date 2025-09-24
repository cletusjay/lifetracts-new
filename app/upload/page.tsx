'use client'

import {useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Badge} from '@/components/ui/badge'
import {Progress} from '@/components/ui/progress'
import {toast} from '@/hooks/use-toast'
import {
    Upload,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
    CloudUpload,
    FileUp,
    Info,
    Plus,
    Loader2
} from 'lucide-react'
import {formatBytes} from '@/lib/utils'

const uploadSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Please select a category'),
    denomination: z.string().min(1, 'Please select a denomination'),
    language: z.string().min(1, 'Please select a language'),
    tags: z.array(z.string()).min(1, 'Add at least one tag'),
    scriptureReferences: z.array(z.string()).optional(),
})

type UploadFormData = z.infer<typeof uploadSchema>

const categories = [
    {value: 'evangelism', label: 'Evangelism'},
    {value: 'discipleship', label: 'Discipleship'},
    {value: 'apologetics', label: 'Apologetics'},
    {value: 'youth', label: 'Youth'},
    {value: 'family', label: 'Family'},
    {value: 'seasonal', label: 'Seasonal'},
]

const denominations = [
    // 'Baptist',
    // 'Methodist',
    // 'Presbyterian',
    // 'Lutheran',
    // 'Catholic',
    // 'Pentecostal',
    // 'Non-denominational',
    'Deeper Life Bible Church',
    'Others',
]

const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Portuguese',
    'Chinese',
    'Arabic',
    'Other',
]

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [currentTag, setCurrentTag] = useState('')
    const [currentScripture, setCurrentScripture] = useState('')

    // Note: Authorization is now handled by the layout.tsx file
    // Only authorized users (admin or uploader) will reach this component

    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        watch,
        reset,
    } = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            tags: [],
            scriptureReferences: [],
        },
    })

    const tags = watch('tags')
    const scriptureReferences = watch('scriptureReferences')
    const selectedCategory = watch('category')
    const selectedDenomination = watch('denomination')
    const selectedLanguage = watch('language')

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf')
        if (pdfFile) {
            setFile(pdfFile)
            // Auto-fill title from filename if empty
            const titleInput = document.getElementById('title') as HTMLInputElement
            if (!titleInput?.value) {
                const titleFromFile = pdfFile.name.replace('.pdf', '').replace(/-|_/g, ' ')
                setValue('title', titleFromFile)
            }
        } else {
            toast({
                title: 'Invalid file type',
                description: 'Please upload a PDF file',
                variant: 'destructive',
            })
        }
    }, [setValue])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
    })

    const handleAddTag = () => {
        if (currentTag.trim() && !tags?.includes(currentTag.trim())) {
            setValue('tags', [...(tags || []), currentTag.trim()])
            setCurrentTag('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setValue('tags', tags?.filter(tag => tag !== tagToRemove) || [])
    }

    const handleAddScripture = () => {
        if (currentScripture.trim() && !scriptureReferences?.includes(currentScripture.trim())) {
            setValue('scriptureReferences', [...(scriptureReferences || []), currentScripture.trim()])
            setCurrentScripture('')
        }
    }

    const handleRemoveScripture = (scriptureToRemove: string) => {
        setValue('scriptureReferences', scriptureReferences?.filter(ref => ref !== scriptureToRemove) || [])
    }

    const onSubmit = async (data: UploadFormData) => {
        if (!file) {
            toast({
                title: 'No file selected',
                description: 'Please select a PDF file to upload',
                variant: 'destructive',
            })
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        // Show upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval)
                    return 90
                }
                return prev + 10
            })
        }, 200)

        try {
            // Create FormData and append all fields
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', data.title)
            formData.append('description', data.description)
            formData.append('category', data.category)
            formData.append('denomination', data.denomination)
            formData.append('language', data.language)
            formData.append('tags', JSON.stringify(data.tags))
            if (data.scriptureReferences) {
                formData.append('scriptureReferences', JSON.stringify(data.scriptureReferences))
            }

            // Make API call to upload tract
            const response = await fetch('/api/tracts/upload', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            setUploadProgress(100)

            toast({
                title: 'Success!',
                description: result.message || 'Your tract has been uploaded and is pending review.',
            })

            // Reset form completely
            reset({
                title: '',
                description: '',
                category: '',
                denomination: '',
                language: '',
                tags: [],
                scriptureReferences: [],
            })
            setFile(null)
            setUploadProgress(0)
            setCurrentTag('')
            setCurrentScripture('')
        } catch (error) {
            console.error('Upload error:', error)
            toast({
                title: 'Upload failed',
                description: error instanceof Error ? error.message : 'Please try again later',
                variant: 'destructive',
            })
        } finally {
            setIsUploading(false)
            clearInterval(interval)
        }
    }

    return (
        <div className="container max-w-4xl py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Upload Tract</h1>
                <p className="text-muted-foreground">
                    Share your gospel tract with the community
                </p>
            </div>

            <div className="grid gap-8">
                {/* File Upload Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload PDF File</CardTitle>
                        <CardDescription>
                            Select or drag and drop your tract PDF (max 10MB)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            {...getRootProps()}
                            className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200 ease-in-out
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}
                ${file ? 'bg-accent' : ''}
              `}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                                {file ? (
                                    <>
                                        <FileText className="h-12 w-12 text-primary"/>
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setFile(null)
                                            }}
                                        >
                                            <X className="h-4 w-4 mr-2"/>
                                            Remove
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <CloudUpload className="h-12 w-12 text-muted-foreground"/>
                                        <div>
                                            <p className="font-medium">
                                                {isDragActive ? 'Drop your file here' : 'Drag & drop your PDF here'}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                or click to browse files
                                            </p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm">
                                            <FileUp className="h-4 w-4 mr-2"/>
                                            Browse Files
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress}/>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tract Details Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tract Details</CardTitle>
                            <CardDescription>
                                Provide information about your tract to help others find it
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter tract title"
                                    {...register('title')}
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your tract and its purpose"
                                    rows={4}
                                    {...register('description')}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description.message}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={selectedCategory || ''}
                                            onValueChange={(value) => setValue('category', value)}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-destructive">{errors.category.message}</p>
                                    )}
                                </div>

                                {/* Denomination */}
                                <div className="space-y-2">
                                    <Label htmlFor="denomination">Denomination *</Label>
                                    <Select value={selectedDenomination || ''}
                                            onValueChange={(value) => setValue('denomination', value)}>
                                        <SelectTrigger id="denomination">
                                            <SelectValue placeholder="Select denomination"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {denominations.map((denom) => (
                                                <SelectItem key={denom} value={denom}>
                                                    {denom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.denomination && (
                                        <p className="text-sm text-destructive">{errors.denomination.message}</p>
                                    )}
                                </div>

                                {/* Language */}
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language *</Label>
                                    <Select value={selectedLanguage || ''}
                                            onValueChange={(value) => setValue('language', value)}>
                                        <SelectTrigger id="language">
                                            <SelectValue placeholder="Select language"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map((lang) => (
                                                <SelectItem key={lang} value={lang}>
                                                    {lang}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.language && (
                                        <p className="text-sm text-destructive">{errors.language.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="tags"
                                        placeholder="Add tags (e.g., salvation, gospel)"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddTag()
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddTag}
                                    >
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags?.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-2 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3"/>
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                {errors.tags && (
                                    <p className="text-sm text-destructive">{errors.tags.message}</p>
                                )}
                            </div>

                            {/* Scripture References */}
                            <div className="space-y-2">
                                <Label htmlFor="scripture">Scripture References (Optional)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="scripture"
                                        placeholder="Add scripture references (e.g., John 3:16)"
                                        value={currentScripture}
                                        onChange={(e) => setCurrentScripture(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddScripture()
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddScripture}
                                    >
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {scriptureReferences?.map((ref) => (
                                        <Badge key={ref} variant="outline">
                                            {ref}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveScripture(ref)}
                                                className="ml-2 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3"/>
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Info className="h-4 w-4"/>
                                <span>Your tract will be reviewed before being published</span>
                            </div>
                            <Button type="submit" disabled={isUploading || !file}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4"/>
                                        Upload Tract
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div>
    )
}