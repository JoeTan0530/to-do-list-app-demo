import React, { useState, useEffect, useRef, useImperativeHandle, useId } from "react";
import Select, { SingleValue, GroupBase, SelectInstance } from "react-select";

// ============================================================
// Types
// ============================================================
type OptionType = { value: string; label: string };

interface CustomSelectProps {
  selectOptions: OptionType[];
  handleSelectValue?: (event: { target: { id: string; value: any } }) => void;
  placeholderDisplay?: string;
  selectID?: string;
  getInputDataKey?: string;
  currentValue?: string | number;
  customSelectRef?: React.Ref<{ resetInput: () => void }>;
}

const CustomSelect: React.FC<CustomSelectProps> = (props) => {
  const {
    selectOptions,
    handleSelectValue,
    placeholderDisplay = "",
    selectID,
    getInputDataKey = "id",
    currentValue = "",
    customSelectRef,
  } = props;

  // Build option list
  const optionList: OptionType[] =
    selectOptions && selectOptions.length > 0
      ? [...selectOptions]
      : [{ value: "", label: "" }];

  const uniqueID = useId();
  const displayID = selectID || `select-${uniqueID}`;

  const [displayType, setDisplayType] = useState<OptionType>(optionList[0]);

  // Ref for react-select – using SelectInstance to avoid generic issues
  const selectRef = useRef<SelectInstance<OptionType, false, GroupBase<OptionType>> | null>(null);

  // Expose resetInput via ref
  useImperativeHandle(customSelectRef, () => ({
    resetInput: () => {
      triggerReset();
    },
  }));

  // Sync with currentValue prop
  useEffect(() => {
    let currOption: OptionType = { value: "", label: "" };
    if (currentValue !== undefined && currentValue !== "" && currentValue !== null) {
      const found = optionList.find((item) => item.value === String(currentValue));
      currOption = found || optionList[0];
    } else {
      currOption = optionList[0];
    }
    setDisplayType(currOption);
  }, [optionList, currentValue]);

  const triggerChange = (onChangeVal: OptionType) => {
    if (!handleSelectValue) return;
    const inputRef = (selectRef.current as any)?.inputRef;
    const id = inputRef?.[getInputDataKey] || displayID;
    handleSelectValue({
      target: {
        id,
        value: onChangeVal.value,
      },
    });
  };

  const triggerReset = () => {
    setDisplayType(optionList[0]);
  };

  const handleChange = (newValue: SingleValue<OptionType>) => {
    if (newValue) {
      setDisplayType(newValue);
      triggerChange(newValue);
    }
  };

  return (
    <Select
      inputId={displayID}
      instanceId={displayID}
      ref={selectRef}
      className="form-select bg-gray-100 border border-gray-300 rounded-lg"
      classNamePrefix="form-select"
      options={optionList}
      value={displayType}
      onChange={handleChange}
      placeholder={placeholderDisplay}
      styles={{
        control: (base) => ({
          ...base,
          border: "none",
          boxShadow: "none",
        }),
      }}
      components={{ IndicatorSeparator: () => null }}
    />
  );
};

export default CustomSelect;