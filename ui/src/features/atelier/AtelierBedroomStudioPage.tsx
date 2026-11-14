import { useEffect } from "react";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";
import { useTheme } from "@/context/ThemeContext";
import { BedroomDesignStudio } from "./BedroomDesignStudio";

export function AtelierBedroomStudioPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { theme } = useTheme();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Thiết kế Nội thất" },
      { label: "Phòng Ngủ 2D & Sổ Quyết Định" },
    ]);
  }, [setBreadcrumbs]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" data-theme={theme}>
      <BedroomDesignStudio />
    </div>
  );
}
