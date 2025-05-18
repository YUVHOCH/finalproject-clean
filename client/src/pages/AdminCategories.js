import React, { useState } from 'react';
import { useCategories } from '../context/CategoryContext';
import styles from '../styles/AdminCategories.module.css';

const AdminCategories = () => {
  const { uploadCategories, loading, error } = useCategories();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
      setSelectedFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    try {
      await uploadCategories(selectedFile);
      setUploadStatus('Categories uploaded successfully!');
      setSelectedFile(null);
      // Reset file input
      document.getElementById('fileInput').value = '';
    } catch (err) {
      setUploadStatus(err.message || 'Error uploading categories');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Categories Management</h2>
      
      <div className={styles.uploadSection}>
        <h3>Upload Categories from Excel</h3>
        <p>Upload an Excel file with the following columns:</p>
        <ul>
          <li>categoryId</li>
          <li>categoryLevel (1-3)</li>
          <li>categoryName</li>
          <li>parentId</li>
          <li>position</li>
          <li>isActive</li>
          <li>slug</li>
        </ul>

        <div className={styles.uploadControls}>
          <input
            type="file"
            id="fileInput"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={styles.uploadButton}
          >
            {loading ? 'Uploading...' : 'Upload Categories'}
          </button>
        </div>

        {uploadStatus && (
          <div className={`${styles.status} ${error ? styles.error : styles.success}`}>
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories; 