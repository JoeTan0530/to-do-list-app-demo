import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";

interface CustomPaginationProps {
	pagingID?: string,
	pagingData?: {},
	pagingFunction?: Function
}

const CustomPagination: React.FC<CustomPaginationProps> = (props) => {
	const { 
		pagingData = {
			pageNumber: 0,
			totalRecord: 0,
			totalPage: 0,
			numRecord: 0
		},
		pagingID,
		pagingFunction
	} = props;

	const [displayPagingItem, setDisplayPagingItem] = useState([]);
	const [displayPagingItemMobile, setDisplayPagingItemMobile] = useState([]);

	const pagingRowID = pagingID || "pager" + document.getElementsByClassName('pagination-container').length;

	const pagerItemsObj = {
		pagerLeftInterval: 4,
		pagerRightInterval: 4,
		pagerLeftIntervalMobile: 1,
		pagerRightIntervalMobile: 1,
	};

	useEffect(() => {
		if (pagingData && pagingData.pageNumber && pagingData.totalPage && pagingData.totalPage !== 1) {
			buildPagingItem();
			buildPagingItem(1);
		} else {
			resetCurrPagingItem();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pagingData]);

	const buildPagingItem = (isMobile) => {
		const currPage = pagingData.pageNumber;
		const maxPaging = pagingData.totalPage;

		let startInterval = currPage - (isMobile ? pagerItemsObj.pagerLeftIntervalMobile : pagerItemsObj.pagerLeftInterval);
		let endInterval = currPage + (isMobile ? pagerItemsObj.pagerRightIntervalMobile : pagerItemsObj.pagerRightInterval);
		let startIntervalOverflow = 0;
		let endIntervalOverflow = 0;

		if (endInterval > maxPaging) {
			endInterval = maxPaging;
			endIntervalOverflow = pagerItemsObj.pagerRightInterval - (maxPaging - currPage);
		}

		if (startInterval < 1) {
			startInterval = 1;
			startIntervalOverflow = pagerItemsObj.pagerLeftInterval - (currPage - startInterval);
		}

		if (startInterval - endIntervalOverflow > 0) {
			startInterval = startInterval - endIntervalOverflow;
		} else {
			startInterval = 1;
		}

		if (endInterval + startIntervalOverflow <= maxPaging) {
			endInterval = endInterval + startIntervalOverflow;
		}

		let pagingItem = [];

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
					active={i === currPage ? true : false}
					onClick={() => {
						handlePagingFunction(i);
					}}>
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
	}

	const resetCurrPagingItem = () => {
		setDisplayPagingItemMobile([]);
		setDisplayPagingItem([]);
	}

	const handlePagingFunction = (pagerNum) => {
		if (!pagingFunction) {
			return;
		}

		if (pagerNum === pagingData.pageNumber) {
			return;
		}

		if (typeof pagerNum === "string") {
			let newPageNum = 1;

			if (pagerNum === "next") {
				newPageNum = pagingData.pageNumber + 1;
			} else if (pagerNum === "prev") {
				newPageNum = pagingData.pageNumber - 1;
			}

			pagingFunction(newPageNum);
		} else {
			pagingFunction(pagerNum);
		}
	}

	return (
		<div className="pagination-container">
			<div className="d-none d-md-flex justify-content-center align-items-center w-100">
				<Pagination>
					{pagingData.pageNumber > 1 && (
						<>
							<Pagination.First
								onClick={() => {
									handlePagingFunction(1);
								}}>
								First
							</Pagination.First>
							<Pagination.Prev
								onClick={() => {
									handlePagingFunction("prev");
								}}
							/>
						</>
					)}
					{displayPagingItem}
					{pagingData.pageNumber !== pagingData.totalPage && (
						<>
							<Pagination.Next
								onClick={()=> {
									handlePagingFunction("next");
								}}
							/>
							<Pagination.Last
								onClick={()=> {
									handlePagingFunction(pagingData.totalPage);
								}}>
								Last
							</Pagination.Last>
						</>
					)}
				</Pagination>
			</div>
			<div className="d-flex d-md-none justify-content-center align-items-center w-100">
				<Pagination>
					{pagingData.pageNumber > 1 && (
						<>
							<Pagination.First
								onClick={() => {
									handlePagingFunction(1);
								}}>
								First
							</Pagination.First>
							<Pagination.Prev
								onClick={() => {
									handlePagingFunction("prev");
								}}
							/>
						</>
					)}
					{displayPagingItemMobile}
					{pagingData.pageNumber !== pagingData.totalPage && (
						<>
							<Pagination.Next
								onClick={()=> {
									handlePagingFunction("next");
								}}
							/>
							<Pagination.Last
								onClick={()=> {
									handlePagingFunction(pagingData.totalPage);
								}}>
								Last
							</Pagination.Last>
						</>
					)}
				</Pagination>
			</div>
		</div>
	)
}

export default CustomPagination;