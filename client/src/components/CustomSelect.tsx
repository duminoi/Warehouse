import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus, Search } from "lucide-react";

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
  addLabel = "Thêm mới",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target as Node);
      const dropdownEl = document.querySelector(".custom-select-dropdown.open-portal");
      const isOutsideDropdown = dropdownEl && !dropdownEl.contains(event.target as Node);

      if (isOutsideContainer && (!dropdownEl || isOutsideDropdown)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updatePosition = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDropdownStyle({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            width: rect.width,
            zIndex: 9999,
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
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div
        className={`form-input flex justify-between items-center cursor-pointer min-h-[44px] ${isOpen ? 'border-primary ring-1 ring-primary' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-text" : "text-text-muted"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && createPortal(
        <div className="custom-select-dropdown open-portal absolute bg-surface border border-border rounded-xl shadow-xl flex flex-col overflow-hidden animate-slide-in" style={dropdownStyle}>
          <div className="p-2 border-b border-border bg-surfaceHover relative flex items-center">
            <Search className="w-4 h-4 text-text-muted absolute left-4" />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-[#0A0D14] border border-border rounded-lg py-2 pl-9 pr-3 text-sm text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {onAddClick && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-secondary bg-secondary/5 border-b border-border hover:bg-secondary/10 transition-colors"
              onClick={() => {
                setIsOpen(false);
                onAddClick();
              }}
            >
              <Plus className="w-4 h-4" />
              {addLabel}
            </button>
          )}
          
          <div className="overflow-y-auto max-h-[250px] p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${value === opt.value ? "bg-primary/10 text-primary font-medium" : "text-text hover:bg-surfaceHover"}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-text-muted text-center cursor-default">
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
