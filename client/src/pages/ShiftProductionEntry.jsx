// ShiftProductionEntry.jsx
import React, { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import api from "../assets/axios";
import TypeSection from "../components/production/TypeSection";
import { Toaster } from "sonner";

const ShiftProductionEntry = () => {
  /** ========================
   * FORM STATE
   * ======================== */
  const [productionDate, setProductionDate] = useState(new Date());
  const [shift, setShift] = useState("A");

  const [supervisor, setSupervisor] = useState("");
  const [supervisors, setSupervisors] = useState([]);

  const [doer, setDoer] = useState("");
  const [doers, setDoers] = useState([]);

  const [types, setTypes] = useState([]);
  const [typeSections, setTypeSections] = useState([]);

  const typeSectionRefs = useRef([]);

  const [loading, setLoading] = useState(false);

  /** ========================
   * DELETE CONFIRM
   * ======================== */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  /** ========================
   * INITIAL FETCHES
   * ======================== */
  useEffect(() => {
    const load = async () => {
      try {
        const [supRes, doRes, typeRes] = await Promise.all([
          api.get("/supervisors"),
          api.get("/doers"),
          api.get("/types"),
        ]);

        setSupervisors(supRes.data.map((s) => s.name));
        setDoers(doRes.data.map((d) => d.name));
        setTypes(typeRes.data);
      } catch (err) {
        toast.error("Failed to load initial data");
      }
    };

    load();
  }, []);

  /** ========================
   * ADD TYPE SECTION
   * ======================== */
  const addTypeSection = () => {
    setTypeSections((prev) => [...prev, { typeName: "", machines: [] }]);
  };

  /** ========================
   * REMOVE TYPE SECTION
   * ======================== */
  const requestDeleteTypeSection = (index) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTypeSection = () => {
    if (deleteIndex !== null) {
      typeSectionRefs.current.splice(deleteIndex, 1);
      setTypeSections((prev) => prev.filter((_, i) => i !== deleteIndex));
    }
    setDeleteIndex(null);
    setShowDeleteConfirm(false);
  };

  /** ========================
   * VALIDATION
   * ======================== */
  const validatePayload = (payload) => {
    if (!payload.productionDate) return "Production date is required.";
    if (!payload.shift) return "Shift is required.";
    if (!payload.supervisor) return "Supervisor is required.";
    if (!payload.doer) return "Doer is required.";

    if (payload.types.length === 0) return "Add at least one Type Section.";

    for (let tIndex = 0; tIndex < payload.types.length; tIndex++) {
      const t = payload.types[tIndex];
      if (!t.typeName) return `Select Type in section ${tIndex + 1}.`;

      if (t.machines.length === 0)
        return `Add at least one Machine in Type ${t.typeName}.`;

      for (let mIndex = 0; mIndex < t.machines.length; mIndex++) {
        const m = t.machines[mIndex];

        if (!m.machineId)
          return `Select a machine in Type ${t.typeName} (Machine ${
            mIndex + 1
          }).`;

        if (!m.entries.length)
          return `Add at least one entry in Machine ${mIndex + 1} of Type ${
            t.typeName
          }.`;

        for (let eIndex = 0; eIndex < m.entries.length; eIndex++) {
          const e = m.entries[eIndex];

          if (!e.category)
            return `Category required (Type ${t.typeName}, Machine ${
              mIndex + 1
            }, Entry ${eIndex + 1}).`;

          if (!e.subCategory)
            return `SubCategory required (Type ${t.typeName}, Machine ${
              mIndex + 1
            }, Entry ${eIndex + 1}).`;

          if (!e.size)
            return `Size required (Type ${t.typeName}, Machine ${
              mIndex + 1
            }, Entry ${eIndex + 1}).`;

          if (!e.uom)
            return `UOM required (Type ${t.typeName}, Machine ${
              mIndex + 1
            }, Entry ${eIndex + 1}).`;
        }
      }
    }

    return null;
  };

  /** ========================
   * SAVE
   * ======================== */
  const handleSave = async () => {
    setLoading(true);

    const typeSectionsData = typeSectionRefs.current
      .filter(Boolean)
      .map((ref) => ref.getData());

    const payload = {
      productionDate: format(productionDate, "yyyy-MM-dd"),
      shift,
      supervisor,
      doer,
      types: typeSectionsData,
    };

    const err = validatePayload(payload);
    if (err) {
      toast.error(err);
      setLoading(false);
      return;
    }

    try {
      await api.post("/entries", payload);
      toast.success("Production saved successfully!");

      handleCancel(); // reset
    } catch (err) {
      toast.error("Failed to save!");
    } finally {
      setLoading(false);
    }
  };

  /** ========================
   * RESET
   * ======================== */
  const handleCancel = () => {
    setProductionDate(new Date());
    setShift("A");
    setSupervisor("");
    setDoer("");
    setTypeSections([]);
    typeSectionRefs.current = [];
  };

  /** ========================
   * RENDER
   * ======================== */
  return (
    <div className="min-h-screen bg-gray-50 sm:p-2">
      <Card className="py-4 sm:py-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Daily Production Entry
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-2 sm:px-6">
          {/* ================= HEADER FIELDS ================= */}
          <div className="flex flex-wrap gap-4">
            {/* PRODUCTION DATE */}
            <div className="space-y-2">
              <Label>Production Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(productionDate, "PPP")}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-2">
                  <Calendar
                    selected={productionDate}
                    onSelect={setProductionDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* SHIFT */}
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="A+B">A+B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SUPERVISOR */}
            <div className="space-y-2">
              <Label>Supervisor</Label>
              <Select value={supervisor} onValueChange={setSupervisor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Supervisor" />
                </SelectTrigger>

                <SelectContent>
                  {supervisors.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DOER */}
            <div className="space-y-2">
              <Label>Doer</Label>
              <Select value={doer} onValueChange={setDoer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Doer" />
                </SelectTrigger>

                <SelectContent>
                  {doers.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ================= TYPE SECTIONS ================= */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Type Sections</Label>

            {typeSections.map((section, tIndex) => (
              <TypeSection
                key={tIndex}
                index={tIndex}
                types={types}
                initialData={section}
                ref={(el) => (typeSectionRefs.current[tIndex] = el)}
                onChange={(updated) =>
                  setTypeSections((prev) =>
                    prev.map((t, i) => (i === tIndex ? updated : t))
                  )
                }
                onDelete={() => requestDeleteTypeSection(tIndex)}
              />
            ))}

            <Button
              onClick={addTypeSection}
              className="w-full sm:w-fit bg-gray-600 text-white hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Type Section
            </Button>
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="flex flex-row justify-end gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-fit bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Saving..." : "Save"}
            </Button>

            <Button variant="outline" onClick={handleCancel} className="w-fit">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DELETE TYPE SECTION CONFIRM */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Type Section {deleteIndex !== null ? deleteIndex + 1 : ""}?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will remove the entire Type Section including all its
              Machines and Item Entries. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={confirmDeleteTypeSection}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
};

export default ShiftProductionEntry;
