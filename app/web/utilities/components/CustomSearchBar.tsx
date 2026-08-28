import { useState, useId } from "react";
import { Form, Button } from "react-bootstrap";

// Icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";

interface CustomSeachBarProps {
	containerID: string,
	searchInputID: string,
	redirectBtn?: Function
	btnArr: [],
}

const CustomSearchBar: React.FC<CustomSeachBarProps> = (props) => {
	const {
		containerID,
		searchInputID,
		redirectBtn,
		btnArr = [],
	} = props;

	const uniqueID = useId();
	const searchBarContainerID = containerID || `defaultSearchBarID${uniqueID}`;

	const [selectedIndex, setSelectedIndex] = useState({});

	const updateSeletedIndex = (value, key) => {
		setSelectedIndex((prevData) => ({
	      ...prevData,
	      [key]: value,
	    }));
	}

	return (
		<div key={searchBarContainerID} className="search-bar-container">
			<div className="bg-white rounded-xl border border-gray-300 w-full p-5">
				<Form id={`searchForm${searchBarContainerID}`}>
					<div className="grid grid-cols-6 gap-4 mb-3">
						<div className="col-span-6 md:col-span-5">
							<Form.Group className="form-group flex flex-row items-center bg-gray-100 rounded-lg p-2" controlId={searchInputID}>
								<div className="me-3">
									<FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400" />
								</div>
								<div className="w-full">
									<Form.Control type="type" className="bg-transparent w-full h-4 focus:outline-none" placeholder="Search"/>
								</div>
							</Form.Group>
						</div>
						<div className="col-span-6 md:col-span-1">
							<Button className="rounded-lg bg-blue-500 hover:bg-blue-400 p-2 cursor-pointer w-full" onClick={redirectBtn}>
								<FontAwesomeIcon icon={faPlus} className="me-2 text-white"/>
								<span className="text-white">Add Task</span>
							</Button>
						</div>
					</div>
					{
						btnArr && btnArr.length > 0 && btnArr.map((rowItem, index) => {
							return (
								<div key={`filter-row-${containerID}-${index}`} className="grid grid-cols-8 gap-4 mb-5 md:mb-3">
									<div className="col-span-8 md:col-span-1">
										<div className="text-lg text-gray-400 text-left md:text-center md:me-2">
											{rowItem['title']}:
										</div>
									</div>
									<div className="col-span-8 md:col-span-7">
										<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
											{
												rowItem['btnItemArr'] && rowItem['btnItemArr'].length > 0 && rowItem['btnItemArr'].map((btnItem, btnIndex) => {
													return (
														<Button
															key={`filter-btn-${rowItem['title']}-${containerID}-${btnIndex}`}

															className={`
																w-full rounded-xl border border-solid border-blue text-blue-600 p-2 cursor-pointer 
																hover:bg-blue-100
																${(selectedIndex[rowItem['title']] && selectedIndex[rowItem['title']] === btnItem['value'])
													              ? 'bg-blue-100' 
													              : 'bg-white'
													            }
															`}
															onClick={() => updateSeletedIndex(btnItem['value'], rowItem['title'])}
														>
															{btnItem['label']}
														</Button>
													)
												})
											}
										</div>
									</div>
								</div>
							)
						})
					}
				</Form>
			</div>
		</div>
	);
}

export default CustomSearchBar;