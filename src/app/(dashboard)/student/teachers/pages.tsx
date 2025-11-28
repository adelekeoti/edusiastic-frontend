// src/app/(dashboard)/student/teachers/page.tsx

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SlidersHorizontal, 
  Star, 
  Users, 
  Award,
  MapPin,
  Loader2,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import { getAllTeachers } from '@/lib/api/teachers';
import { getAllCategories } from '@/lib/api/categories';
import { TeacherFilters } from '@/lib/api/teachers';

export default function TeacherDirectoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TeacherFilters>({
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch teachers
  const { data: teachersData, isLoading: loadingTeachers } = useQuery({
    queryKey: ['teachers', filters],
    queryFn: () => getAllTeachers(filters)
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  // Handle response structure - backend returns { data: { teachers: [], pagination: {} } }
  const teachers = Array.isArray(teachersData?.data?.teachers) 
    ? teachersData.data.teachers 
    : Array.isArray(teachersData?.data)
      ? teachersData.data
      : [];
  
  const pagination = teachersData?.data?.pagination;
  const categories = categoriesData?.data?.categories || [];

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.id === filters.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleFilterChange = (key: keyof TeacherFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value, page: 1 };
      
      // Reset subcategory when category changes
      if (key === 'categoryId') {
        delete newFilters.subcategoryId;
      }
      
      return newFilters;
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.search;
        return newFilters;
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTeacherClick = (teacherId: string) => {
    router.push(`/student/teachers/${teacherId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Teachers</h1>
          <p className="text-gray-600 mt-2">
            Browse verified teachers and find the perfect match for your learning needs
          </p>
        </div>

        {/* Search & Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search teachers by name or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  {/* Category */}
                  <Select
                    value={filters.categoryId || 'all'}
                    onValueChange={(value) => handleFilterChange('categoryId', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Subcategory */}
                  <Select
                    value={filters.subcategoryId || 'all'}
                    onValueChange={(value) => handleFilterChange('subcategoryId', value === 'all' ? undefined : value)}
                    disabled={!filters.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Minimum Rating */}
                  <Select
                    value={filters.minRating?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('minRating', value === 'all' ? undefined : parseFloat(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4.5">4.5★ & above</SelectItem>
                      <SelectItem value="4.0">4.0★ & above</SelectItem>
                      <SelectItem value="3.5">3.5★ & above</SelectItem>
                      <SelectItem value="3.0">3.0★ & above</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Experience */}
                  <Select
                    value={filters.minExperience?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('minExperience', value === 'all' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Experience</SelectItem>
                      <SelectItem value="1">1+ years</SelectItem>
                      <SelectItem value="3">3+ years</SelectItem>
                      <SelectItem value="5">5+ years</SelectItem>
                      <SelectItem value="10">10+ years</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Home Tutoring */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="homeTutoring"
                      checked={filters.isAvailableForHomeTutoring || false}
                      onChange={(e) => handleFilterChange('isAvailableForHomeTutoring', e.target.checked || undefined)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="homeTutoring" className="text-sm text-gray-700">
                      Available for home tutoring
                    </label>
                  </div>

                  {/* Sort By */}
                  <Select
                    value={filters.sortBy || 'rating'}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="experience">Most Experienced</SelectItem>
                      <SelectItem value="students">Most Students</SelectItem>
                      <SelectItem value="createdAt">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loadingTeachers ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : teachers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No teachers found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher: any) => (
                <Card
                  key={teacher.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleTeacherClick(teacher.id)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={teacher.profileImage || '/default-avatar.png'}
                        alt={`${teacher.firstName} ${teacher.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">
                            {teacher.title && `${teacher.title} `}
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                          {teacher.teacherStatus === 'APPROVED' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        {teacher.headline && (
                          <p className="text-sm text-gray-600 line-clamp-2">{teacher.headline}</p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {teacher.averageRating && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-semibold">
                              {teacher.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{teacher.totalRatings} reviews</p>
                        </div>
                      )}
                      {teacher.totalStudents && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold">{teacher.totalStudents}</span>
                          </div>
                          <p className="text-xs text-gray-500">students</p>
                        </div>
                      )}
                      {teacher.yearsOfExperience && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Award className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold">{teacher.yearsOfExperience}</span>
                          </div>
                          <p className="text-xs text-gray-500">years</p>
                        </div>
                      )}
                    </div>

                    {/* Expertise */}
                    {teacher.teacherExpertise?.subcategory && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {teacher.teacherExpertise.subcategory.category?.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {teacher.teacherExpertise.subcategory.name}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Specializations */}
                    {teacher.specializations && teacher.specializations.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.specializations.slice(0, 3).map((spec: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {teacher.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{teacher.specializations.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Home Tutoring Badge */}
                    {teacher.isAvailableForHomeTutoring && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <MapPin className="w-4 h-4" />
                        <span>Available for home tutoring</span>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Button variant="outline" className="w-full mt-4">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600 px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}