import { useState } from "react";

export function useEditDataField(initialDetails) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [details, setDetails] = useState(initialDetails);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleChange = (e, field) => {
        setDetails({ ...details, [field]: e.target.innerText });
    };

    return { isEditMode, details, toggleEditMode, handleChange };
}