// ShiftProductionEntry.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "../assets/axios";
import MachineSection from "../components/ui/MachineSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "sonner";

const ShiftProductionEntry = () => {
  const [productionDate, setProductionDate] = useState(new Date());
  const [shift, setShift] = useState("A");
  const [doer, setDoer] = useState("");
  const [doers, setDoers] = useState([]);
  const [supervisor, setSupervisor] = useState("");
  const [machineSections, setMachineSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const machineSectionRefs = useRef([]);
  const [showMachineConfirm, setShowMachineConfirm] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await api.get("/machines");
        setMachines(res.data);
      } catch (err) {
        console.error("Failed to fetch machines:", err);
        toast.error("Failed to load machines. Please refresh the page.");
      }
    };

    fetchMachines();
  }, []);

  useEffect(() => {
    const fetchDoers = async () => {
      try {
        const res = await api.get("/doers");
        setDoers(res.data.map((row) => row.name));
      } catch (err) {
        console.error("Failed to fetch doers:", err);
        toast.error("Failed to load doers. Please refresh the page.");
      }
    };

    fetchDoers();
  }, []);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await api.get("/supervisors");
        setSupervisors(res.data.map((row) => row.name));
      } catch (err) {
        console.error("Failed to fetch supervisors:", err);
        toast.error("Failed to load supervisors. Please refresh the page.");
      }
    };

    fetchSupervisors();
  }, []);

  const addMachineSection = () => {
    setMachineSections((prev) => [...prev, {}]);
  };

  const requestRemoveMachine = (index) => {
    setIndexToDelete(index);
    setShowMachineConfirm(true);
  };

  const confirmDeleteMachine = () => {
    if (indexToDelete !== null) {
      machineSectionRefs.current.splice(indexToDelete, 1);
      setMachineSections((prev) => prev.filter((_, i) => i !== indexToDelete));
    }
    setShowMachineConfirm(false);
    setIndexToDelete(null);
  };

  const validateData = (data) => {
    if (!data.doer) return "Doer is required.";
    if (!data.productionDate) return "Production date is required.";
    if (!data.shift) return "Shift is required.";
    if (!data.supervisor) return "Supervisor is required.";
    if (data.machineSections.length === 0)
      return "At least one machine section is required.";

    for (let i = 0; i < data.machineSections.length; i++) {
      const section = data.machineSections[i];
      if (!section.machineId)
        return `Machine selection is required for section ${i + 1}.`;
      if (section.productionEntries.length === 0)
        return `At least one production entry is required for machine section ${
          i + 1
        }.`;

      for (let j = 0; j < section.productionEntries.length; j++) {
        const entry = section.productionEntries[j];
        if (!entry.category)
          return `Category is required for entry ${j + 1} in machine section ${
            i + 1
          }.`;
        if (!entry.subCategory)
          return `Sub-category is required for entry ${
            j + 1
          } in machine section ${i + 1}.`;
        if (!entry.size)
          return `Size is required for entry ${j + 1} in machine section ${
            i + 1
          }.`;
        if (!entry.uom)
          return `UOM is required for entry ${j + 1} in machine section ${
            i + 1
          }.`;
        // Optional fields like quantities can be empty strings (0)
      }
    }
    return null;
  };

  const handleSave = async () => {
    if (!supervisor || !doer) {
      toast.error("Please select a shift supervisor and doer.");
      return;
    }

    // Collect data from child refs
    const machineSectionsData = machineSectionRefs.current
      .filter((ref) => ref)
      .map((ref) => ref.getData());

    const payload = {
      productionDate: format(productionDate, "yyyy-MM-dd"),
      shift,
      supervisor,
      doer,
      machineSections: machineSectionsData,
    };

    const validationError = validateData(payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/entries", payload);
      if (response.status === 201 || response.status === 200) {
        toast.success("Data saved successfully!");
        // Reset form after success
        handleCancel();
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("Failed to save production entry:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save data. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMachineSections([]);
    machineSectionRefs.current = [];
    setSupervisor("");
    setDoer("");
    setProductionDate(new Date());
    setShift("A");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="">
        <Card className="py-3 sm:py-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">
              Daily Production Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-3 sm:px-6">
            <div className="grid grid-cols-4 sm:flex gap-4">
              {/* Production Date */}
              <div className="space-y-2 col-span-3 sm:col-span-1">
                <Label htmlFor="date">Production Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !productionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {productionDate ? (
                        format(productionDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={productionDate}
                      onSelect={setProductionDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Shift */}
              <div className="space-y-2 col-span-1 sm:col-span-1">
                <Label htmlFor="shift">Shift</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="A+B">A+B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Shift Supervisor */}
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="supervisor">Shift Supervisor</Label>
                <Select value={supervisor} onValueChange={setSupervisor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((sup) => (
                      <SelectItem key={sup} value={sup}>
                        {sup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="doer">Doer</Label>
                <Select value={doer} onValueChange={setDoer}>
                  <SelectTrigger className="w-full">
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

            {/* Machine Sections */}
            <div className="space-y-4 ">
              <Label className="text-lg font-semibold">Machine Sections</Label>
              {machineSections.map((_, mIndex) => (
                <MachineSection
                  key={mIndex}
                  index={mIndex}
                  machines={machines}
                  ref={(el) => {
                    machineSectionRefs.current[mIndex] = el;
                  }}
                  onRequestRemove={requestRemoveMachine}
                />
              ))}
            </div>
            {/* Actions */}
            <div className="flex flex-col justify-end sm:flex-row gap-4 pt-4">
              <Button onClick={addMachineSection} className="w-full sm:w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Add Machine Section
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 sm:flex-0"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || !supervisor}
                className="flex-1 sm:flex-0 bg-green-600 hover:bg-green-700 text-white hover:text-white"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AlertDialog
          open={showMachineConfirm}
          onOpenChange={setShowMachineConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete Machine Section{" "}
                {indexToDelete !== null ? indexToDelete + 1 : ""}? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteMachine}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
      </div>
    </div>
  );
};

export default ShiftProductionEntry;
