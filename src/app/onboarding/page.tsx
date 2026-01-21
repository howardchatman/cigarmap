'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Upload,
  User,
  Building2,
  Share2,
  ImageIcon,
  Sparkles,
  Store,
  Truck,
  Factory,
  Package,
  Users,
  Check,
  X,
  Camera,
} from 'lucide-react';

type BusinessType = 'lounge' | 'mobile_lounge' | 'manufacturer' | 'accessory_company' | 'organization';

interface OnboardingData {
  // Step 1: Owner Info
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  avatarFile: File | null;

  // Step 2: Business Type & Info
  businessType: BusinessType | '';
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;

  // Step 3: Social & Website
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;

  // Step 4: Images
  coverImageUrl: string | null;
  coverImageFile: File | null;
  businessImages: File[];
  businessImageUrls: string[];

  // Step 5: Website Builder
  wantsWebsite: boolean;
  selectedPlan: 'basic' | 'pro' | 'premium' | null;
}

const businessTypes = [
  { id: 'lounge', label: 'Cigar Lounge', icon: Store, description: 'Physical cigar lounge or bar' },
  { id: 'mobile_lounge', label: 'Mobile Lounge', icon: Truck, description: 'Mobile cigar service or truck' },
  { id: 'manufacturer', label: 'Cigar Manufacturer', icon: Factory, description: 'Cigar producer or brand' },
  { id: 'accessory_company', label: 'Accessory Company', icon: Package, description: 'Cigar accessories & merchandise' },
  { id: 'organization', label: 'Cigar Organization', icon: Users, description: 'Club, group, or association' },
] as const;

const steps = [
  { id: 1, title: 'Your Profile', icon: User },
  { id: 2, title: 'Business Info', icon: Building2 },
  { id: 3, title: 'Social Media', icon: Share2 },
  { id: 4, title: 'Images', icon: ImageIcon },
  { id: 5, title: 'Website Builder', icon: Sparkles },
];

export default function Onboarding() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    phone: '',
    avatarUrl: null,
    avatarFile: null,
    businessType: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    coverImageUrl: null,
    coverImageFile: null,
    businessImages: [],
    businessImageUrls: [],
    wantsWebsite: false,
    selectedPlan: null,
  });

  // Pre-fill with existing profile data
  useEffect(() => {
    if (profile) {
      setData(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        avatarUrl: profile.avatar_url || null,
      }));
    }
  }, [profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirectTo=/onboarding');
    }
  }, [user, authLoading, router]);

  const progress = (currentStep / steps.length) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({
        avatarFile: file,
        avatarUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({
        coverImageFile: file,
        coverImageUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleBusinessImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newUrls = files.map(f => URL.createObjectURL(f));
      updateData({
        businessImages: [...data.businessImages, ...files],
        businessImageUrls: [...data.businessImageUrls, ...newUrls],
      });
    }
  };

  const removeBusinessImage = (index: number) => {
    updateData({
      businessImages: data.businessImages.filter((_, i) => i !== index),
      businessImageUrls: data.businessImageUrls.filter((_, i) => i !== index),
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.fullName.trim().length > 0;
      case 2:
        return data.businessType && data.businessName.trim().length > 0;
      case 3:
        return true; // Social media is optional
      case 4:
        return true; // Images are optional
      case 5:
        return true; // Can skip website builder
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { data: uploadData, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Upload avatar if provided
      let avatarUrl = data.avatarUrl;
      if (data.avatarFile) {
        const path = `avatars/${user.id}/${Date.now()}-${data.avatarFile.name}`;
        avatarUrl = await uploadFile(data.avatarFile, 'profiles', path);
      }

      // Upload cover image if provided
      let coverUrl = data.coverImageUrl;
      if (data.coverImageFile) {
        const path = `covers/${user.id}/${Date.now()}-${data.coverImageFile.name}`;
        coverUrl = await uploadFile(data.coverImageFile, 'businesses', path);
      }

      // Upload business images
      const uploadedImageUrls: string[] = [];
      for (const file of data.businessImages) {
        const path = `images/${user.id}/${Date.now()}-${file.name}`;
        const url = await uploadFile(file, 'businesses', path);
        if (url) uploadedImageUrls.push(url);
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone || null,
          avatar_url: avatarUrl,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create or update business
      const businessData = {
        owner_id: user.id,
        business_type: data.businessType,
        name: data.businessName,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zipCode || null,
        description: data.description || null,
        website: data.website || null,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        twitter: data.twitter || null,
        tiktok: data.tiktok || null,
        cover_image: coverUrl,
        images: uploadedImageUrls,
        wants_website: data.wantsWebsite,
        subscription_plan: data.selectedPlan,
        status: 'pending',
      };

      // For lounges, insert into lounges table; for others, businesses table
      if (data.businessType === 'lounge' || data.businessType === 'mobile_lounge') {
        const { error: loungeError } = await supabase
          .from('lounges')
          .insert({
            owner_id: user.id,
            name: data.businessName,
            address: data.address || null,
            phone: data.phone || null,
            website: data.website || null,
            description: data.description || null,
            lounge_type: data.businessType === 'lounge' ? 'Lounge' : 'Lounge',
            images: uploadedImageUrls,
            cover_image: coverUrl,
            instagram: data.instagram || null,
            facebook: data.facebook || null,
            twitter: data.twitter || null,
            tiktok: data.tiktok || null,
            wants_website: data.wantsWebsite,
            status: 'pending',
          });

        if (loungeError) throw loungeError;
      }

      toast({
        title: 'Welcome to CigarMap!',
        description: 'Your profile has been set up successfully.',
      });

      // Redirect based on whether they want a website
      if (data.wantsWebsite && data.selectedPlan) {
        router.replace('/dashboard/billing?upgrade=' + data.selectedPlan);
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-amber-50">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="CigarMap.net"
            width={180}
            height={54}
            className="h-auto mx-auto"
            priority
          />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    isActive ? 'text-amber-600' : isCompleted ? 'text-green-600' : 'text-stone-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      isActive
                        ? 'bg-amber-100 border-2 border-amber-600'
                        : isCompleted
                        ? 'bg-green-100 border-2 border-green-600'
                        : 'bg-stone-100 border-2 border-stone-300'
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          {/* Step 1: Owner Profile */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600" />
                  Your Profile
                </CardTitle>
                <CardDescription>
                  Tell us about yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {data.avatarUrl ? (
                        <img
                          src={data.avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-stone-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-700 transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">Add a profile photo</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={data.fullName}
                    onChange={(e) => updateData({ fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => updateData({ phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Business Type & Info */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  What type of business do you have?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business Type Selection */}
                <div className="space-y-3">
                  <Label>Business Type *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {businessTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = data.businessType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => updateData({ businessType: type.id as BusinessType })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon
                              className={`h-6 w-6 ${
                                isSelected ? 'text-amber-600' : 'text-stone-400'
                              }`}
                            />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={data.businessName}
                    onChange={(e) => updateData({ businessName: e.target.value })}
                    placeholder="The Velvet Smoke Lounge"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={data.address}
                    onChange={(e) => updateData({ address: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={data.city}
                      onChange={(e) => updateData({ city: e.target.value })}
                      placeholder="Houston"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={data.state}
                      onChange={(e) => updateData({ state: e.target.value })}
                      placeholder="TX"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={data.zipCode}
                      onChange={(e) => updateData({ zipCode: e.target.value })}
                      placeholder="77002"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => updateData({ description: e.target.value })}
                    placeholder="Tell us about your business..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Social Media & Website */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-amber-600" />
                  Social Media & Website
                </CardTitle>
                <CardDescription>
                  Help customers find you online (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={data.website}
                    onChange={(e) => updateData({ website: e.target.value })}
                    placeholder="https://yourlounge.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="instagram"
                      value={data.instagram}
                      onChange={(e) => updateData({ instagram: e.target.value })}
                      placeholder="yourlounge"
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={data.facebook}
                    onChange={(e) => updateData({ facebook: e.target.value })}
                    placeholder="facebook.com/yourlounge"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">X (Twitter)</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="twitter"
                      value={data.twitter}
                      onChange={(e) => updateData({ twitter: e.target.value })}
                      placeholder="yourlounge"
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="tiktok"
                      value={data.tiktok}
                      onChange={(e) => updateData({ tiktok: e.target.value })}
                      placeholder="yourlounge"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Images */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-amber-600" />
                  Images
                </CardTitle>
                <CardDescription>
                  Add photos to showcase your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cover Image */}
                <div className="space-y-2">
                  <Label>Cover Banner</Label>
                  <div className="relative">
                    <div className="w-full h-40 bg-stone-200 rounded-lg overflow-hidden">
                      {data.coverImageUrl ? (
                        <img
                          src={data.coverImageUrl}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-stone-400">
                          <ImageIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                      <div className="text-white text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <span>Upload Cover Image</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Business Photos */}
                <div className="space-y-2">
                  <Label>Business Photos</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {data.businessImageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={url}
                          alt={`Business ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeBusinessImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-amber-600 hover:bg-amber-50 transition-colors">
                      <Upload className="h-6 w-6 text-stone-400 mb-1" />
                      <span className="text-xs text-stone-400">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleBusinessImagesUpload}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Website Builder */}
          {currentStep === 5 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  Create Your Website
                </CardTitle>
                <CardDescription>
                  Get a professional website for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                  <h3 className="font-semibold text-lg mb-2">
                    Want a professional website?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Let us build and host a beautiful website for your business. No technical skills required!
                  </p>

                  <RadioGroup
                    value={data.wantsWebsite ? 'yes' : 'no'}
                    onValueChange={(v) => updateData({ wantsWebsite: v === 'yes' })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Yes, I want a website</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">No thanks, I'll skip for now</Label>
                    </div>
                  </RadioGroup>
                </div>

                {data.wantsWebsite && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Choose Your Plan</h3>
                    <div className="grid gap-4">
                      {/* Pro Plan */}
                      <button
                        type="button"
                        onClick={() => updateData({ selectedPlan: 'pro' })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          data.selectedPlan === 'pro'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold text-lg">Pro</span>
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Most Popular
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold">$49</span>
                            <span className="text-muted-foreground">/mo</span>
                          </div>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Professional website template
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Verified badge on CigarMap
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Priority search placement
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Monthly analytics dashboard
                          </li>
                        </ul>
                      </button>

                      {/* Premium Plan */}
                      <button
                        type="button"
                        onClick={() => updateData({ selectedPlan: 'premium' })}
                        className={`p-4 rounded-lg border-2 text-left transition-all relative overflow-hidden ${
                          data.selectedPlan === 'premium'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-purple-500 text-white text-xs px-3 py-1 rounded-bl">
                          Best Value
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-lg">Premium</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold">$99</span>
                            <span className="text-muted-foreground">/mo</span>
                          </div>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600" />
                            Everything in Pro
                          </li>
                          <li className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-700">AI-Powered Social Posts</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-700">AI Event Description Generator</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600" />
                            Featured on homepage & city pages
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600" />
                            Event & promotions posting
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600" />
                            Direct messaging from users
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600" />
                            Priority customer support
                          </li>
                        </ul>
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 pt-0">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finishing...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Skip Link */}
        {currentStep < 5 && (
          <p className="text-center mt-4 text-sm text-muted-foreground">
            <button
              onClick={() => setCurrentStep(5)}
              className="text-amber-600 hover:underline"
            >
              Skip to website builder
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
