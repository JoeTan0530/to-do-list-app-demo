import React, { useEffect } from "react";
import { Table } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faBook } from '@fortawesome/free-solid-svg-icons';

// Import components
import CustomPagination from './CustomPagination.tsx';

interface CustomTableProps {
	listingID: string,
	listingData: [],
	thArray: [],
	listingCss: {}
}

const CustomTable: React.FC<CustomTableProps> = (props) => {

	const { 
		listingID, 
		listingData, 
		thArray, 
		listingCss, 
		pagingData,
		pagingFunction
	} = props;

	const tableID = listingID || `defaultListID${document.getElementsByClassName("listing-table-container").length}`;

	const verifyIsArrayItem = (verifyItem) => {
		if (verifyItem && Array.isArray(verifyItem) && verifyItem.length > 0) {
			return true;
		} else {
			return false;
		}
	}

	const verifyIsObjectItem = (verifyItem) => {
		if (verifyItem !== null && !Array.isArray(verifyItem) && typeof verifyItem === 'object' && Object.keys(verifyItem).length > 0) {
			return true;
		} else {
			return false;
		}
	}

	const getCssStyleFromObj = (listCssObj, type, cellIndex) => {
		let listCellCss = {};

		if (verifyIsObjectItem(listCssObj) && verifyIsArrayItem(listCssObj[type])) {
			let listCellCssObj = listCssObj[type].find((item) => {
				return item.index === cellIndex;
			});

			if (listCellCssObj) {
				listCellCss = listCellCssObj['css'] ? listCellCssObj['css'] : {};
			}
		}

		return listCellCss;
	}


	if (verifyIsArrayItem(listingData)) {
		return (
			<>
				<div className="listing-table-container">
					<Table className="listing-table">
						{
							(verifyIsArrayItem(thArray)) && (
								<thead>
									<tr>
										{
											thArray && thArray.map((headerVal, headerIndex) => {
												let headerCellCss = getCssStyleFromObj(listingCss, "header", headerIndex);

												return (
													<th key={`header${tableID}${headerIndex}`} style={headerCellCss}>
														{headerVal}
													</th>
												)
											})
										}
									</tr>
								</thead>
							)
						}
						{
							(verifyIsArrayItem(thArray)) && (
								<tbody>
									{
										listingData && listingData.map((listingVal, listingIndex) => {
											return (
												<tr key={`tableDataRow${tableID}${listingIndex}`}>
													{
														Object.entries(listingVal).map(([dataKey, dataVal], dataIndex) => {
															let listingCellCss = getCssStyleFromObj(listingCss, "listing", dataIndex);

															return (
																<td key={`tableDataCell${tableID}${listingIndex}-${dataIndex}`} style={listingCellCss}>
																	{dataVal}
																</td>
															)	
														})
													}
												</tr>
											)
										})
									}
								</tbody>
							)
						}
					</Table>
				</div>
				{pagingData && (
					<div className="mt-3">
						<CustomPagination pagingID={listingID} pagingData={pagingData} pagingFunction={pagingFunction} />
					</div>
				)}
			</>
		)
	} else {
		return (
			<div className="listing-table-no-data-container">
				<FontAwesomeIcon icon={faBook} className="listing-table-no-data-icon"/>
				<div className="text-center font-size-md font-weight-bold primary-text-color mb-1">No Books Found</div>
				<div className="text-center font-size-sm font-weight-thick secondary-text-color">Start building your reading collection</div>
			</div>
		)
	}
}

export default CustomTable;