// src/components/ai/RecommendationCards.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, ExternalLink, BookOpen, FileText, Video, Home } from 'lucide-react';
import { Recommendations } from '@/lib/api/aiChat';
import { formatCurrency } from '@/lib/utils/formatters';

interface RecommendationCardsProps {
  recommendations: Recommendations;
}

export function RecommendationCards({ recommendations }: RecommendationCardsProps) {
  const router = useRouter();

  if (recommendations.teachers.length === 0 && recommendations.products.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Teacher Recommendations */}
      {recommendations.teachers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recommended Teachers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.teachers.map((teacher) => (
              <Card 
                key={teacher.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/teacher/${teacher.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.profileImage || '/default-avatar.png'}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {teacher.firstName} {teacher.lastName}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">{teacher.expertise}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span>{teacher.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{teacher.totalStudents} students</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Product Recommendations */}
      {recommendations.products.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Recommended Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.products.map((product) => {
              const getProductIcon = () => {
                switch (product.type) {
                  case 'PDF':
                    return <FileText className="h-6 w-6 text-blue-600" />;
                  case 'SUBSCRIPTION':
                    return <Video className="h-6 w-6 text-blue-600" />;
                  case 'HOME_TUTORING':
                    return <Home className="h-6 w-6 text-blue-600" />;
                  default:
                    return <BookOpen className="h-6 w-6 text-blue-600" />;
                }
              };

              return (
                <Card 
                  key={product.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                          {getProductIcon()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {product.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">by {product.teacherName}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {product.type === 'SUBSCRIPTION' ? 'Subscription' : 
                             product.type === 'PDF' ? 'PDF' : 'Tutoring'}
                          </Badge>
                          <span className="text-sm font-bold text-blue-600">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}