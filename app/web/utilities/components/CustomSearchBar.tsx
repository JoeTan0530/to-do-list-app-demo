import { useState } from "react";
import { Form, Button } from "react-bootstrap";

// Icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";

interface CustomSeachBarProps {
	containerID: string,
	searchInputID: string,
	filterStatus: []
}

const CustomSearchBar: React.FC<CustomSeachBarProps> = (props) => {
	const {
		containerID,
		searchInputID,
		filterStatus = []
	} = props;

	const searchBarContainerID = containerID || `defaultSearchBarID${document.getElementsByClassName("search-bar-container").length}`;

	const [selectedIndex, setSelectedIndex] = useState(0);

	return (
		<div key={searchBarContainerID} className="search-bar-container">
			<div className="bg-white rounded-xl border border-gray-300 w-full p-5">
				<Form id="searchForm">
					<div className="grid grid-cols-6 gap-4 mb-3">
						<div className="col-span-5">
							<Form.Group className="form-group flex flex-row items-center bg-gray-100 rounded-lg p-2" controlId={searchInputID}>
								<div className="me-3">
									<FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400" />
								</div>
								<div className="w-full">
									<Form.Control type="type" className="bg-transparent w-full h-4 focus:outline-none" placeholder="Search"/>
								</div>
							</Form.Group>
						</div>
						<div className="">
							<Button className="rounded-lg bg-blue-500 hover:bg-blue-400 p-2 cursor-pointer">
								<FontAwesomeIcon icon={faPlus} className="me-2 text-white"/>
								<span className="text-white">Add Task</span>
							</Button>
						</div>
					</div>
					<div className="grid grid-cols-10 gap-4">
						<div className="">
							<div className="text-lg text-gray-400 me-2">
								Filter:
							</div>
						</div>
						<div className="col-span-9">
							<div className="grid grid-cols-6 gap-3">
								{
									filterStatus && filterStatus.length > 0 && filterStatus.map((item, index) => {
										return (
											<Button
												key={`filter-btn-${containerID}-${index}`}

												className={`
													w-full rounded-xl border border-solid border-blue text-blue-600 p-2 cursor-pointer 
													hover:bg-blue-100
													${selectedIndex === index 
										              ? 'bg-blue-100' 
										              : 'bg-white'
										            }
												`}
												onClick={() => setSelectedIndex(index)}
											>
												{item['label']}
											</Button>
										)
									})
								}
							</div>
						</div>
					</div>
				</Form>
			</div>
		</div>
	);
}

export default CustomSearchBar;