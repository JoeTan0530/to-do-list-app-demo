import React, { useState, useId, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";

interface BtnItem {
  label: string;
  value: string | number;
}

interface FilterRow {
  id: string;
  title: string;
  btnItemArr: BtnItem[];
}

interface CustomSearchBarProps {
  containerID: string;
  searchInputID: string;
  redirectBtn?: () => void;
  btnArr: FilterRow[];
  formDataState?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const CustomSearchBar: React.FC<CustomSearchBarProps> = ({
  containerID,
  searchInputID,
  redirectBtn,
  btnArr = [],
  formDataState,
}) => {
  const uniqueID = useId();
  const searchBarContainerID = containerID || `defaultSearchBarID${uniqueID}`;

  const [selectedIndex, setSelectedIndex] = useState<Record<string, string | number>>({});
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const updateSelectedIndex = (value: string | number, key: string) => {
    setSelectedIndex((prev) => ({ ...prev, [key]: value }));
    updateToFormState(key, value);
  };

  const updateFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateToFormState(id, value);
    }, 300);
  };

  const updateToFormState = (id: string, value: string | number) => {
    if (formDataState) {
      formDataState((prev) => ({ ...prev, [id]: value }));
    }
  };

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
                  <Form.Control
                    type="text"
                    className="bg-transparent w-full h-4 focus:outline-none"
                    placeholder="Search"
                    onChange={updateFormData}
                  />
                </div>
              </Form.Group>
            </div>
            <div className="col-span-6 md:col-span-1">
              <Button
                className="rounded-lg bg-blue-500 hover:bg-blue-400 p-2 cursor-pointer w-full"
                onClick={redirectBtn}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2 text-white" />
                <span className="text-white">Add Task</span>
              </Button>
            </div>
          </div>
          {btnArr.map((rowItem, rowIndex) => (
            <div key={`filter-row-${containerID}-${rowIndex}`} className="grid grid-cols-8 gap-4 mb-5 md:mb-3">
              <div className="col-span-8 md:col-span-1">
                <div className="text-lg text-gray-400 text-left md:me-2">{rowItem.title}:</div>
              </div>
              <div className="col-span-8 md:col-span-7">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {rowItem.btnItemArr.map((btnItem, btnIndex) => {
                    const isActive = selectedIndex[rowItem.id] === btnItem.value;
                    return (
                      <Button
                        key={`filter-btn-${rowItem.title}-${containerID}-${btnIndex}`}
                        className={`
                          w-full rounded-xl border border-solid border-blue text-blue-600 p-2 cursor-pointer 
                          hover:bg-blue-100 ${isActive ? "bg-blue-100" : "bg-white"}
                        `}
                        onClick={() => updateSelectedIndex(btnItem.value, rowItem.id)}
                      >
                        {btnItem.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </Form>
      </div>
    </div>
  );
};

export default CustomSearchBar;