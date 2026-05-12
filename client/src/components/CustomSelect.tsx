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
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="custom-select-search-container" style={{ padding: 'var(--space-sm)', borderBottom: '1px solid var(--color-border)' }}>
            <input
              ref={searchInputRef}
              type="text"
              className="form-input"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: 'var(--space-xs) var(--space-sm)',
                fontSize: 'var(--font-size-sm)',
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-border-focus)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

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
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
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
              ))
            ) : (
              <div className="custom-option" style={{ color: "var(--color-text-muted)", cursor: "default" }}>
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
