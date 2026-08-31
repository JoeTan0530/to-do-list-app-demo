import React, { useState, useEffect, useId } from "react";
import { Pagination } from "react-bootstrap";

// ============================================================
// Types
// ============================================================
interface PagingData {
  pageNumber: number;
  totalRecord: number;
  totalPage: number;
  numRecord: number;
}

interface CustomPaginationProps {
  pagingID?: string;
  pagingData?: PagingData;
  pagingFunction?: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = (props) => {
  const {
    pagingData = {
      pageNumber: 0,
      totalRecord: 0,
      totalPage: 0,
      numRecord: 0,
    },
    pagingID,
    pagingFunction,
  } = props;

  // State for pagination items (desktop and mobile)
  const [displayPagingItem, setDisplayPagingItem] = useState<React.ReactElement[]>([]);
  const [displayPagingItemMobile, setDisplayPagingItemMobile] = useState<React.ReactElement[]>([]);

  const uniqueID = useId();
  const pagingRowID = pagingID || `pager-${uniqueID}`;

  const btnClassName = "py-1 px-3 mx-1 hover:bg-blue-100 rounded-lg cursor-pointer";

  const pagerItemsObj = {
    pagerLeftInterval: 4,
    pagerRightInterval: 4,
    pagerLeftIntervalMobile: 1,
    pagerRightIntervalMobile: 1,
  };

  // Build pagination items when pagingData changes
  useEffect(() => {
    if (pagingData && pagingData.pageNumber && pagingData.totalPage && pagingData.totalPage !== 1) {
      buildPagingItem(false); // desktop
      buildPagingItem(true); // mobile
    } else {
      resetCurrPagingItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagingData]);

  // Build pagination items for desktop or mobile
  const buildPagingItem = (isMobile: boolean) => {
    const currPage = pagingData.pageNumber;
    const maxPaging = pagingData.totalPage;

    // Calculate intervals
    const leftInterval = isMobile ? pagerItemsObj.pagerLeftIntervalMobile : pagerItemsObj.pagerLeftInterval;
    const rightInterval = isMobile ? pagerItemsObj.pagerRightIntervalMobile : pagerItemsObj.pagerRightInterval;

    let startInterval = currPage - leftInterval;
    let endInterval = currPage + rightInterval;
    let startIntervalOverflow = 0;
    let endIntervalOverflow = 0;

    if (endInterval > maxPaging) {
      endInterval = maxPaging;
      endIntervalOverflow = rightInterval - (maxPaging - currPage);
    }

    if (startInterval < 1) {
      startInterval = 1;
      startIntervalOverflow = leftInterval - (currPage - startInterval);
    }

    if (startInterval - endIntervalOverflow > 0) {
      startInterval = startInterval - endIntervalOverflow;
    } else {
      startInterval = 1;
    }

    if (endInterval + startIntervalOverflow <= maxPaging) {
      endInterval = endInterval + startIntervalOverflow;
    }

    const pagingItem: React.ReactElement[] = [];

    if (startInterval !== 1) {
      pagingItem.push(
        <Pagination.Ellipsis
          key={`${pagingRowID}PaginationLeftEllipsis${isMobile ? "Mobile" : ""}`}
          className="pagination-ellipsis"
        />
      );
    }

    for (let i = startInterval; i <= endInterval; i++) {
      pagingItem.push(
        <Pagination.Item
          key={`${pagingRowID}Pagination${i}${isMobile ? "Mobile" : ""}`}
          active={i === currPage}
          onClick={() => handlePagingFunction(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    if (endInterval !== maxPaging) {
      pagingItem.push(
        <Pagination.Ellipsis
          key={`${pagingRowID}PaginationRightEllipsis${isMobile ? "Mobile" : ""}`}
          className="pagination-ellipsis"
        />
      );
    }

    if (isMobile) {
      setDisplayPagingItemMobile(pagingItem);
    } else {
      setDisplayPagingItem(pagingItem);
    }
  };

  const resetCurrPagingItem = () => {
    setDisplayPagingItemMobile([]);
    setDisplayPagingItem([]);
  };

  const handlePagingFunction = (pagerNum: number | "next" | "prev") => {
    if (!pagingFunction) return;

    if (typeof pagerNum === "string") {
      let newPageNum = 1;
      if (pagerNum === "next") {
        newPageNum = pagingData.pageNumber + 1;
      } else if (pagerNum === "prev") {
        newPageNum = pagingData.pageNumber - 1;
      }
      pagingFunction(newPageNum);
    } else {
      // If the clicked page is the current page, do nothing
      if (pagerNum === pagingData.pageNumber) return;
      pagingFunction(pagerNum);
    }
  };

  return (
    <div className="pagination-container">
      {/* Desktop pagination */}
      <div className="hidden md:flex flex-row justify-center items-center w-full">
        <Pagination className="flex flex-row">
          {pagingData.pageNumber > 1 && (
            <>
              <Pagination.First onClick={() => handlePagingFunction(1)}>
                First
              </Pagination.First>
              <Pagination.Prev onClick={() => handlePagingFunction("prev")} />
            </>
          )}
          {displayPagingItem}
          {pagingData.pageNumber !== pagingData.totalPage && (
            <>
              <Pagination.Next onClick={() => handlePagingFunction("next")} />
              <Pagination.Last onClick={() => handlePagingFunction(pagingData.totalPage)}>
                Last
              </Pagination.Last>
            </>
          )}
        </Pagination>
      </div>

      {/* Mobile pagination */}
      <div className="flex md:hidden flex-row justify-center items-center w-full">
        <Pagination className="flex flex-row">
          {pagingData.pageNumber > 1 && (
            <>
              <Pagination.First onClick={() => handlePagingFunction(1)}>
                First
              </Pagination.First>
              <Pagination.Prev onClick={() => handlePagingFunction("prev")} />
            </>
          )}
          {displayPagingItemMobile}
          {pagingData.pageNumber !== pagingData.totalPage && (
            <>
              <Pagination.Next onClick={() => handlePagingFunction("next")} />
              <Pagination.Last onClick={() => handlePagingFunction(pagingData.totalPage)}>
                Last
              </Pagination.Last>
            </>
          )}
        </Pagination>
      </div>
    </div>
  );
};

export default CustomPagination;