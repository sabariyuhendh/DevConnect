import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Bookmark,
  ExternalLink,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { apiRequest } from '@/config/api';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  locationType: string;
  employmentType: string;
  experienceLevel: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  createdAt: string;
  viewCount: number;
  applicationCount: number;
  _count: {
    applications: number;
    savedBy: number;
  };
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    locationType: 'all',
    employmentType: 'all',
    experienceLevel: 'all'
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch jobs
  const fetchJobs = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(search && { search }),
        ...(filters.locationType && filters.locationType !== 'all' && { locationType: filters.locationType }),
        ...(filters.employmentType && filters.employmentType !== 'all' && { employmentType: filters.employmentType }),
        ...(filters.experienceLevel && filters.experienceLevel !== 'all' && { experienceLevel: filters.experienceLevel })
      });

      const response = await apiRequest(`/api/jobs?${params}`, {
        method: 'GET'
      });

      const newJobs = response.data || [];
      const meta = response.meta;

      if (reset) {
        setJobs(newJobs);
      } else {
        setJobs(prev => [...prev, ...newJobs]);
      }

      setHasMore(meta && meta.page < meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, search, filters]);

  // Initial load
  useEffect(() => {
    setPage(1);
    fetchJobs(1, true);
  }, [search, filters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchJobs(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, fetchJobs]);

  const formatSalary = (job: Job) => {
    if (!job.salaryMin && !job.salaryMax) return 'Salary not disclosed';
    
    const currency = job.salaryCurrency || 'USD';
    const period = job.salaryPeriod || 'YEARLY';
    
    if (job.salaryMin && job.salaryMax) {
      return `${currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / ${period.toLowerCase()}`;
    }
    
    return `${currency} ${(job.salaryMin || job.salaryMax)?.toLocaleString()} / ${period.toLowerCase()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Find Your Next Opportunity</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Browse {jobs.length}+ verified job postings from top companies
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Location Type */}
              <Select
                value={filters.locationType || undefined}
                onValueChange={(value) => setFilters(prev => ({ ...prev, locationType: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Location Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              {/* Employment Type */}
              <Select
                value={filters.employmentType || undefined}
                onValueChange={(value) => setFilters(prev => ({ ...prev, employmentType: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(search || (filters.locationType && filters.locationType !== 'all') || (filters.employmentType && filters.employmentType !== 'all')) && (
              <div className="mt-3 sm:mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setFilters({ locationType: 'all', employmentType: 'all', experienceLevel: 'all' });
                  }}
                  className="text-xs sm:text-sm"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-3 sm:space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex gap-3 sm:gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold mb-1 truncate">{job.title}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground truncate">{job.company}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{job.employmentType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{formatSalary(job)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        {formatDate(job.createdAt)}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      <Badge variant="secondary" className="text-xs">{job.locationType}</Badge>
                      <Badge variant="secondary" className="text-xs">{job.experienceLevel.replace('_', ' ')}</Badge>
                    </div>

                    {/* Description Preview */}
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                      {job.description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                      <Button className="w-full sm:w-auto text-sm">
                        Apply Now
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto text-sm">
                        View Details
                        <ExternalLink className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="text-xs sm:text-sm text-muted-foreground text-center sm:ml-auto">
                        {job._count.applications} applicants
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading more jobs...</p>
              </CardContent>
            </Card>
          )}

          {/* Intersection Observer Target */}
          <div ref={observerTarget} className="h-10" />

          {/* No More Jobs */}
          {!hasMore && jobs.length > 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  You've reached the end of the job listings
                </p>
              </CardContent>
            </Card>
          )}

          {/* No Jobs Found */}
          {!loading && jobs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No jobs found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  );
};

export default Jobs;
