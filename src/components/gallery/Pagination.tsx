
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

const Pagination = ({ 
  currentPage, 
  pageSize, 
  totalItems, 
  onPageChange,
  showPageNumbers = true
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const delta = 1; // How many pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }
    
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    
    return rangeWithDots;
  };
  
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 py-4">
      {/* First page button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="First page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      
      {/* Previous page button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {/* Page numbers */}
      {showPageNumbers && getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2">...</span>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            disabled={currentPage === page}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        )
      ))}
      
      {/* Page indicator for mobile (shown when page numbers are hidden) */}
      {!showPageNumbers && (
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
      )}
      
      {/* Next page button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Last page button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
