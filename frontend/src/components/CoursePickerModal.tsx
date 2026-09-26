"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Globe } from "lucide-react";
import { PixelCard } from "@/components/react-bits";
import { PressableButton } from "@/components/PressableButton";

export interface CourseData {
  id: number;
  slug: string;
  title: string;
  flag_emoji?: string;
  flag_asset?: string;
  source_language?: string;
  target_language?: string;
  description?: string;
  native_name?: string;
  learner_name?: string;
  language_family?: string;
  locale_code?: string;
  units_count?: number;
}

interface CoursePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseData[];
  activeCourseId: number;
  onSelectCourse: (course: CourseData) => void;
}

const LANGUAGE_FAMILIES = [
  "All",
  "Romance",
  "Germanic",
  "Slavic",
  "East Asian",
  "Semitic & Afroasiatic",
  "Indo-Aryan",
  "Uralic & Finno-Ugric",
  "Other",
];

export function CoursePickerModal({
  isOpen,
  onClose,
  courses,
  activeCourseId,
  onSelectCourse,
}: CoursePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("All");

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Family filter
      if (selectedFamily !== "All") {
        if (selectedFamily === "Other") {
          const knownFamilies = [
            "Romance",
            "Germanic",
            "Slavic",
            "East Asian",
            "Semitic & Afroasiatic",
            "Indo-Aryan",
            "Uralic & Finno-Ugric",
          ];
          if (c.language_family && knownFamilies.includes(c.language_family)) {
            return false;
          }
        } else if (
          !c.language_family ||
          !c.language_family.toLowerCase().includes(selectedFamily.toLowerCase())
        ) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(query);
        const nativeMatch = c.native_name?.toLowerCase().includes(query);
        const learnerMatch = c.learner_name?.toLowerCase().includes(query);
        const langMatch = c.target_language?.toLowerCase().includes(query);
        const familyMatch = c.language_family?.toLowerCase().includes(query);
        return titleMatch || nativeMatch || learnerMatch || langMatch || familyMatch;
      }

      return true;
    });
  }, [courses, selectedFamily, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#131f24] border-2 border-[#2b3940] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#2b3940] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-[#1cb0f6]" />
            <h2 className="text-xl font-black text-white">Choose a Language Course</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1a2b32] text-[#9aa9b2] border border-[#2b3940]">
              {courses.length} courses
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9aa9b2] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-[#2b3940] space-y-4 bg-[#0e161a]/60">
          <div className="relative">
            <Search className="w-5 h-5 text-[#5d6f78] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 60+ world languages (e.g. Japanese, Español, Hindi, Arabic)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131f24] border-2 border-[#2b3940] focus:border-[#58cc02] rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-white placeholder-[#5d6f78] outline-none transition"
            />
          </div>

          {/* Language Family Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LANGUAGE_FAMILIES.map((fam) => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedFamily === fam
                    ? "bg-[#58cc02] text-white"
                    : "bg-[#1a2b32] text-[#9aa9b2] hover:text-white hover:bg-[#253942]"
                }`}
              >
                {fam}
              </button>
            ))}
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((c) => {
              const isSelected = c.id === activeCourseId;
              const displayName = c.learner_name || c.target_language || c.title;
              const native = c.native_name || "";
              const flag = c.flag_emoji || "🌐";

              return (
                <PixelCard
                  key={c.id}
                  title={displayName}
                  subtitle={native}
                  flag={flag}
                  family={c.language_family || "Language"}
                  learners={
                    isSelected
                      ? "Active Course"
                      : `${((c.id * 137000 + 45000) % 900000 + 100000).toLocaleString()}`
                  }
                  selected={isSelected}
                  onClick={() => {
                    onSelectCourse(c);
                    onClose();
                  }}
                />
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-[#9aa9b2]">
              <Globe className="w-12 h-12 mx-auto text-[#5d6f78] mb-3 opacity-50" />
              <p className="font-bold text-base text-white">No courses matched your search</p>
              <p className="text-xs text-[#5d6f78] mt-1">Try searching for a different language name or dialect</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2b3940] flex justify-end bg-[#0e161a]/60">
          <PressableButton variant="neutral" size="sm" onClick={onClose}>
            Close
          </PressableButton>
        </div>
      </div>
    </div>
  );
}

export default CoursePickerModal;
