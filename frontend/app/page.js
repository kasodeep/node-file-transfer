"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Download, FileIcon, AlertCircle } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const API_URL = "http://192.168.1.9:5000";

export default function FileList() {
  const [files, setFiles] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // useEffect to fetch the files from the server.
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = () => {
    setLoading(true);
    fetch(`${API_URL}/files`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch files");
        }
        return res.json();
      })
      .then((data) => {
        setFiles(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // download files from the server.
  const downloadFile = (filename) => {
    window.location.href = `${API_URL}/download/${filename}`;
  };

  // uploading the files on the server.
  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    toast({
      title: "Uploading files...",
      description: "Please wait while we process your files.",
    });

    fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setFiles((prevFiles) => [...prevFiles, ...data.filenames]);
        toast({
          title: "Upload successful!",
          description: `${data.filenames.length} files uploaded.`,
        });
      })
      .catch((err) => {
        setError(err.message);
        toast({
          title: "Upload failed",
          description: err.message,
          variant: "destructive",
        });
      });
  };

  const confirmDelete = (filename) => {
    setFileToDelete(filename);
    setIsDeleteDialogOpen(true);
  };

  const deleteFile = () => {
    if (!fileToDelete) return;

    fetch(`${API_URL}/delete/${fileToDelete}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete file");
        }
        return res.json();
      })
      .then(() => {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file !== fileToDelete),
        );
        toast({
          title: "File deleted",
          description: `${fileToDelete} has been removed.`,
        });
      })
      .catch((err) => {
        setError(err.message);
        toast({
          title: "Delete failed",
          description: err.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setFileToDelete(null);
        setIsDeleteDialogOpen(false);
      });
  };

  const getFileIcon = (fileType) => {
    const fileIcons = {
      pdf: <FileIcon className="w-8 h-8 text-red-500" />, // PDF - Red
      jpg: <FileIcon className="w-8 h-8 text-blue-400" />, // Image - Blue
      jpeg: <FileIcon className="w-8 h-8 text-blue-400" />,
      png: <FileIcon className="w-8 h-8 text-blue-400" />,
      gif: <FileIcon className="w-8 h-8 text-blue-400" />,
      docx: <FileIcon className="w-8 h-8 text-blue-600" />, // Word - Blue
      txt: <FileIcon className="w-8 h-8 text-gray-400" />, // Text - Gray
      java: <FileIcon className="w-8 h-8 text-orange-500" />, // Java - Orange
      js: <FileIcon className="w-8 h-8 text-yellow-500" />, // JavaScript - Yellow
      py: <FileIcon className="w-8 h-8 text-green-500" />, // Python - Green
      ipynb: <FileIcon className="w-8 h-8 text-purple-500" />, // Jupyter Notebook - Purple
    };

    return (
      fileIcons[fileType] || <FileIcon className="w-8 h-8 text-yellow-300" />
    ); // Default icon
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateY: -15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
    hover: {
      scale: 1.05,
      rotateY: 5,
      z: 50,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateY: -30,
      transition: {
        duration: 0.3,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/goku.jpeg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>

      {/* Navbar */}
      <nav className="relative z-10 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 p-4 text-center text-xl font-bold shadow-2xl uppercase flex justify-between items-center">
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-extrabold tracking-wider flex items-center"
        >
          <span className="mr-2 text-3xl">⚡</span>
          Goku Transfer
        </motion.span>
        <motion.label
          whileHover={{ scale: 1.1, rotateZ: 2 }}
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-2.5 rounded-lg shadow-lg flex items-center space-x-2 font-bold transform perspective-500"
          style={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Upload className="w-5 h-5" />
          <span>Upload</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </motion.label>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto p-6">
        {loading && (
          <div className="flex justify-center items-center h-40">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full"
            ></motion.div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-lg flex items-center space-x-3 mx-auto max-w-md"
          >
            <AlertCircle className="w-6 h-6" />
            <p className="text-white font-semibold">Error: {error}</p>
          </motion.div>
        )}

        {!loading && !error && files.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-center mx-auto max-w-md"
          >
            <p className="text-gray-300 text-lg font-semibold">
              No files available. Upload some files to get started!
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 mt-8 perspective-1000"
          >
            {!loading &&
              !error &&
              files.map((file, index) => (
                <AnimatePresence key={file}>
                  <motion.div
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    exit="exit"
                    layout
                    className="perspective-card"
                  >
                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-orange-600/90 to-red-700/90 backdrop-blur-md text-white rounded-xl transform transition-all duration-300 h-full">
                      <div className="absolute inset-0 bg-black opacity-20 rounded-xl"></div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.split(".").pop())}
                            <h3 className="text-xl font-bold text-yellow-300 truncate max-w-[150px]">
                              {file}
                            </h3>
                          </div>
                          <div className="bg-yellow-500/20 px-2 py-1 rounded-md text-xs font-medium text-yellow-200 uppercase">
                            {file.split(".").pop()}
                          </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:translate-y-[-2px]"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                          <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 transform hover:translate-y-[-2px]"
                            onClick={() => confirmDelete(file)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gray-900 border border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete{" "}
              <span className="text-yellow-400 font-medium">
                {fileToDelete}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteFile}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
