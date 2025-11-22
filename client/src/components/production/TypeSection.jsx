// components/production/TypeSection.jsx
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

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

import { ChevronDown, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import MachineSection from "./MachineSection";

const TypeSection = forwardRef(
  ({ index, types, initialData, onChange, onDelete }, ref) => {
    /** Local state */
    const [typeName, setTypeName] = useState(initialData.typeName || "");
    const [machines, setMachines] = useState(initialData.machines || []);
    const [open, setOpen] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const machineRefs = React.useRef([]);

    /** Sync upward */
    useEffect(() => {
      onChange({ typeName, machines });
    }, [typeName, machines]);

    /** Expose getData to parent */
    useImperativeHandle(ref, () => ({
      getData: () => ({
        typeName,
        machines: machineRefs.current
          .filter(Boolean)
          .map((ref) => ref.getData()),
      }),
    }));

    /** Add machine section */
    const addMachine = () => {
      setMachines((prev) => [...prev, { machineId: "", entries: [] }]);
    };

    /** Delete machine */
    const removeMachine = (machineIndex) => {
      machineRefs.current.splice(machineIndex, 1);
      setMachines((prev) => prev.filter((_, i) => i !== machineIndex));
    };

    return (
      <>
        <Card className="p-2 sm:p-3 border">
          <Collapsible open={open} onOpenChange={setOpen}>
            {/* HEADER */}
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center bg-gray-600 text-white px-3 rounded-md cursor-pointer">
                <span className="font-medium text-sm">
                  Type {index + 1} {typeName && `— ${typeName}`}
                </span>

                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform",
                      open && "rotate-180"
                    )}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-300 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CollapsibleTrigger>

            {/* BODY */}
            <CollapsibleContent>
              <div className="pt-2 sm:p-3 space-y-4">
                {/* SELECT TYPE */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Type</label>

                  <Select
                    value={typeName}
                    onValueChange={(v) => {
                      setTypeName(v);
                      setMachines([]); // reset machines on type change
                      machineRefs.current = [];
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Type" />
                    </SelectTrigger>

                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* MACHINE SECTIONS */}
                <div className="space-y-4">
                  {machines.map((machine, mIdx) => (
                    <MachineSection
                      key={mIdx}
                      index={mIdx}
                      typeName={typeName}
                      initialData={machine}
                      ref={(el) => (machineRefs.current[mIdx] = el)}
                      onChange={(updated) => {
                        setMachines((prev) =>
                          prev.map((m, i) => (i === mIdx ? updated : m))
                        );
                      }}
                      onDelete={() => removeMachine(mIdx)}
                    />
                  ))}
                </div>

                {/* ADD MACHINE BUTTON */}
                <Button
                  onClick={addMachine}
                  disabled={!typeName}
                  className="w-full sm:w-fit bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Machine
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* DELETE CONFIRMATION */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete Type Section {index + 1}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This type section including all machines and item entries will
                be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

TypeSection.displayName = "TypeSection";
export default TypeSection;
