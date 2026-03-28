"use client";

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Reusable confirmation dialog.
 *
 * Used for both single-file and bulk deletes.
 *
 * Props:
 *   open         boolean
 *   title        string
 *   description  ReactNode
 *   onConfirm    () => void
 *   onCancel     () => void
 */
export function DeleteDialog({ open, title, description, onConfirm, onCancel }) {
    return (
        <AlertDialog open={open} onOpenChange={open => !open && onCancel()}>
            <AlertDialogContent className="bg-gray-900 border border-gray-700 text-white shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400 text-sm leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={onCancel}
                        className="bg-gray-800 text-white hover:bg-gray-700 border-gray-600"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-500 border-0"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}