import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface CustomSelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number | "";
  onChange: (value: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  onAddClick?: () => void;
  addLabel?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "-- Chọn --",
  onAddClick,
  addLabel = "➕ Thêm mới",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Close when click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Need to check both container and the portal dropdown
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target as Node);
      const dropdownEl = document.querySelector(".custom-select-dropdown.open-portal");
      const isOutsideDropdown = dropdownEl && !dropdownEl.contains(event.target as Node);

      if (isOutsideContainer && (!dropdownEl || isOutsideDropdown)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update position of portal
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updatePosition = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDropdownStyle({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            width: rect.width,
            zIndex: 9999, // Ensure it's on top
          });
        }
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef}>
      <div
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "selected-text" : "placeholder-text"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="dropdown-icon">▼</span>
      </div>

      {isOpen && createPortal(
        <div className="custom-select-dropdown open-portal" style={dropdownStyle}>
          {onAddClick && (
            <div
              className="custom-select-add-btn"
              onClick={() => {
                setIsOpen(false);
                onAddClick();
              }}
            >
              {addLabel}
            </div>
          )}
          
          <div className="options-list">
            <div
              className={`custom-option ${value === "" ? "selected" : ""}`}
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
            >
              {placeholder}
            </div>
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`custom-option ${value === opt.value ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
