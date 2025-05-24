'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { createWhiteLabelSettings, updateWhiteLabelSettings } from '@/lib/actions/white-label'
import { AlertCircle, Palette, Globe, Settings, CreditCard } from 'lucide-react'

const whiteLabelSchema = z.object({
  tenantId: z.string().optional(),
  organizationName: z.string().min(1, 'Organization name is required'),
  domain: z.string().optional(),
  subdomain: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
  logoLight: z.string().url().optional().or(z.literal('')),
  logoDark: z.string().url().optional().or(z.literal('')),
  favicon: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  headerHtml: z.string().optional(),
  footerHtml: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  socialLinks: z.string().optional(),
  contactInfo: z.string().optional(),
  currency: z.string().default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  language: z.string().default('en'),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  taxNumber: z.string().optional(),
  billingAddress: z.string().optional(),
  paymentMethods: z.string().optional(),
  features: z.string().optional(),
  limits: z.string().optional(),
})

type WhiteLabelFormData = z.infer<typeof whiteLabelSchema>

interface WhiteLabelSettingsProps {
  initialData?: any
  tenantId?: string
}

const timezones = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
]

const currencies = [
  { value: 'INR', label: '₹ Indian Rupee' },
  { value: 'USD', label: '$ US Dollar' },
  { value: 'EUR', label: '€ Euro' },
  { value: 'GBP', label: '£ British Pound' },
  { value: 'JPY', label: '¥ Japanese Yen' },
  { value: 'AUD', label: 'A$ Australian Dollar' },
  { value: 'CAD', label: 'C$ Canadian Dollar' },
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
]

export function WhiteLabelSettings({ initialData, tenantId }: WhiteLabelSettingsProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const form = useForm<WhiteLabelFormData>({
    resolver: zodResolver(whiteLabelSchema),
    defaultValues: {
      tenantId: tenantId || '',
      organizationName: initialData?.organizationName || '',
      domain: initialData?.domain || '',
      subdomain: initialData?.subdomain || '',
      logo: initialData?.logo || '',
      logoLight: initialData?.logoLight || '',
      logoDark: initialData?.logoDark || '',
      favicon: initialData?.favicon || '',
      primaryColor: initialData?.primaryColor || '#3b82f6',
      secondaryColor: initialData?.secondaryColor || '#1e293b',
      accentColor: initialData?.accentColor || '#06b6d4',
      backgroundColor: initialData?.backgroundColor || '#ffffff',
      textColor: initialData?.textColor || '#1f2937',
      customCss: initialData?.customCss || '',
      customJs: initialData?.customJs || '',
      headerHtml: initialData?.headerHtml || '',
      footerHtml: initialData?.footerHtml || '',
      seoTitle: initialData?.seoTitle || '',
      seoDescription: initialData?.seoDescription || '',
      seoKeywords: initialData?.seoKeywords || '',
      socialLinks: initialData?.socialLinks ? JSON.stringify(initialData.socialLinks) : '',
      contactInfo: initialData?.contactInfo ? JSON.stringify(initialData.contactInfo) : '',
      currency: initialData?.currency || 'INR',
      timezone: initialData?.timezone || 'Asia/Kolkata',
      dateFormat: initialData?.dateFormat || 'DD/MM/YYYY',
      timeFormat: initialData?.timeFormat || '24h',
      language: initialData?.language || 'en',
      taxRate: initialData?.taxRate || 0,
      taxNumber: initialData?.taxNumber || '',
      billingAddress: initialData?.billingAddress ? JSON.stringify(initialData.billingAddress) : '',
      paymentMethods: initialData?.paymentMethods ? JSON.stringify(initialData.paymentMethods) : '',
      features: initialData?.features ? JSON.stringify(initialData.features) : '',
      limits: initialData?.limits ? JSON.stringify(initialData.limits) : '',
    },
  })

  const onSubmit = (data: WhiteLabelFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString())
          }
        })

        const result = initialData && tenantId
          ? await updateWhiteLabelSettings(tenantId, formData)
          : await createWhiteLabelSettings(formData)

        if (result.success) {
          setMessage({ type: 'success', text: 'White-label settings saved successfully!' })
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to save settings' })
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An unexpected error occurred' })
      }
    })
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="branding" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="domain" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domain
              </TabsTrigger>
              <TabsTrigger value="customization" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Customization
              </TabsTrigger>
              <TabsTrigger value="localization" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Localization
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Identity</CardTitle>
                  <CardDescription>
                    Configure your organization's visual identity and branding elements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/logo.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="favicon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Favicon URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/favicon.ico" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logoLight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Light Theme Logo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/logo-light.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logoDark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dark Theme Logo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/logo-dark.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Color Palette</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" className="w-12 h-10 p-1 rounded" {...field} />
                              </FormControl>
                              <FormControl>
                                <Input placeholder="#3b82f6" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" className="w-12 h-10 p-1 rounded" {...field} />
                              </FormControl>
                              <FormControl>
                                <Input placeholder="#1e293b" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" className="w-12 h-10 p-1 rounded" {...field} />
                              </FormControl>
                              <FormControl>
                                <Input placeholder="#06b6d4" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" className="w-12 h-10 p-1 rounded" {...field} />
                              </FormControl>
                              <FormControl>
                                <Input placeholder="#ffffff" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" className="w-12 h-10 p-1 rounded" {...field} />
                              </FormControl>
                              <FormControl>
                                <Input placeholder="#1f2937" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domain">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Configuration</CardTitle>
                  <CardDescription>
                    Set up custom domains and subdomains for your white-labeled platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Domain</FormLabel>
                          <FormControl>
                            <Input placeholder="academy.yourcompany.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your custom domain (requires DNS configuration)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subdomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subdomain</FormLabel>
                          <FormControl>
                            <Input placeholder="yourcompany" {...field} />
                          </FormControl>
                          <FormDescription>
                            Subdomain on our platform (yourcompany.rojgarskill.com)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">SEO Configuration</Label>
                    <FormField
                      control={form.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Academy - Online Learning Platform" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Learn new skills with our comprehensive online courses..." 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seoKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Keywords</FormLabel>
                          <FormControl>
                            <Input placeholder="online learning, courses, education, skills" {...field} />
                          </FormControl>
                          <FormDescription>
                            Comma-separated keywords for search engines
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customization">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Customization</CardTitle>
                  <CardDescription>
                    Add custom CSS, JavaScript, and HTML to further customize your platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customCss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom CSS</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="/* Add your custom CSS here */"
                            className="min-h-[120px] font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Custom CSS styles to override default styling
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customJs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom JavaScript</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="// Add your custom JavaScript here"
                            className="min-h-[120px] font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Custom JavaScript for additional functionality (use carefully)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="headerHtml"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Header HTML</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="<div>Custom header content</div>"
                              className="min-h-[100px] font-mono text-sm"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Custom HTML for header section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerHtml"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Footer HTML</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="<div>Custom footer content</div>"
                              className="min-h-[100px] font-mono text-sm"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Custom HTML for footer section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="socialLinks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Links (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='{"facebook": "https://facebook.com/yourcompany", "twitter": "https://twitter.com/yourcompany"}'
                              className="min-h-[100px] font-mono text-sm"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Social media links in JSON format
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Info (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='{"email": "support@yourcompany.com", "phone": "+91 12345 67890"}'
                              className="min-h-[100px] font-mono text-sm"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Contact information in JSON format
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="localization">
              <Card>
                <CardHeader>
                  <CardTitle>Localization Settings</CardTitle>
                  <CardDescription>
                    Configure language, timezone, and regional preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.value} value={currency.value}>
                                  {currency.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timezones.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                  {tz}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="12h">12 Hour</SelectItem>
                              <SelectItem value="24h">24 Hour</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Tax Configuration</CardTitle>
                  <CardDescription>
                    Configure tax rates, billing information, and payment settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              step="0.01"
                              placeholder="18.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Tax rate to apply to transactions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Number</FormLabel>
                          <FormControl>
                            <Input placeholder="GST Number, VAT Number, etc." {...field} />
                          </FormControl>
                          <FormDescription>
                            Your organization's tax identification number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="billingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Address (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='{"street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "zip": "400001", "country": "India"}'
                            className="min-h-[100px] font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Billing address in JSON format
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethods"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enabled Payment Methods (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='["razorpay", "cashfree", "paypal", "stripe"]'
                            className="min-h-[80px] font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          List of enabled payment methods
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enabled Features (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='["courses", "live_classes", "certificates", "analytics"]'
                              className="min-h-[100px] font-mono text-sm"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            List of enabled platform features
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="limits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Limits (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='{"max_courses": 100, "max_students": 1000, "storage_gb": 50}'
                              className="min-h-[100px] font-mono text-sm"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Resource limits for this tenant
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : initialData ? 'Update Settings' : 'Create Settings'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 