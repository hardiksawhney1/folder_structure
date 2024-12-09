import React, { useState, useEffect } from 'react';
import { fetchData, addItem } from './ApiService';
import { 
  VscChevronRight,
  VscFolder,
  VscFile,
  VscFileMedia,
  VscDesktopDownload,
  VscJson,
  VscCode,
  VscFileCode,
  VscSymbolColor,
  VscPreview,
  VscNewFile,
  VscNewFolder
} from 'react-icons/vsc';
import './FileExplorer.css';

function Form() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const fetchedData = await fetchData();
        setData(fetchedData);
        // Initialize all folders as expanded
        const initialExpanded = {
          evaluation: true  // Add the main folder to initial state
        };
        Object.keys(fetchedData).forEach(key => {
          initialExpanded[key] = true;
          if (typeof fetchedData[key] === 'object' && !Array.isArray(fetchedData[key])) {
            Object.keys(fetchedData[key]).forEach(subKey => {
              initialExpanded[`${key}-${subKey}`] = true;
            });
          }
        });
        setExpandedFolders(initialExpanded);
      } catch (err) {
        setError('Failed to fetch data');
        setData({});
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const getFileIcon = (fileName) => {
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) return <VscPreview className="file-icon" />;
    if (fileName.match(/\.(mp4|mov|avi|wmv)$/i)) return <VscFileMedia className="file-icon" />;
    if (fileName.match(/\.(js|jsx)$/i)) return <VscCode className="file-icon" />;
    if (fileName.match(/\.(ts|tsx)$/i)) return <VscCode className="file-icon" />;
    if (fileName.match(/\.css$/i)) return <VscSymbolColor className="file-icon" />;
    if (fileName.match(/\.html$/i)) return <VscFileCode className="file-icon" />;
    if (fileName.match(/\.json$/i)) return <VscJson className="file-icon" />;
    if (fileName.match(/\.dmg$/i)) return <VscDesktopDownload className="file-icon" />;
    return <VscFile className="file-icon" />;
  };

  const sortAlphabetically = (a, b) => {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  };

  const handleFileClick = (filePath) => {
    setActiveItem(filePath);
  };

  const getParentPath = (activeItem) => {
    if (!activeItem) return '';
    
    // Split the path into parts
    const parts = activeItem.split('/');
    
    // If it's a directory (ends with '/')
    if (activeItem.endsWith('/')) {
      return parts.slice(0, -2).join('/');
    }
    
    // If it's a file or regular directory
    return parts.slice(0, -1).join('/');
  };

  const handleAddFile = async () => {
    try {
      setError(null);
      let parentPath;
      
      if (!activeItem) {
        // If nothing is selected, add to root
        parentPath = 'root';
      } else if (activeItem.includes('.')) {
        // If a file is selected, get its parent folder
        const parts = activeItem.split('/');
        parts.pop();
        parentPath = parts.length === 0 ? 'root' : parts.join('/');
      } else {
        // If a folder is selected, use that folder
        parentPath = activeItem;
      }

      const fileName = `NewFile${Math.floor(Math.random() * 1000)}.txt`;
      console.log('Adding file:', fileName, 'to path:', parentPath); // Debug log
      
      const response = await addItem(parentPath, 'file', fileName);
      if (response.success) {
        setData(response.data);
        setActiveItem(fileName);
        setExpandedFolders(prev => ({
          ...prev,
          [parentPath]: true
        }));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.error || 'Failed to add file');
    }
  };

  const handleAddFolder = async () => {
    try {
      setError(null);
      let parentPath;
      
      if (!activeItem) {
        // If nothing is selected, add to root level
        parentPath = '';
      } else if (activeItem.includes('.')) {
        // If a file is selected, get its parent folder
        const parts = activeItem.split('/');
        parts.pop();
        parentPath = parts.join('/');
      } else {
        // If a folder is selected, use that folder
        parentPath = activeItem;
      }

      const folderName = `NewFolder${Math.floor(Math.random() * 1000)}`;
      console.log('Adding folder:', folderName, 'to path:', parentPath); // Debug log
      
      const response = await addItem(parentPath, 'folder', folderName);
      if (response.success) {
        setData(response.data);
        setActiveItem(folderName);
        setExpandedFolders(prev => ({
          ...prev,
          [parentPath]: true
        }));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.error || 'Failed to add folder');
    }
  };

  const renderContent = () => {
    if (!data || Object.keys(data).length === 0) return null;

    let rootItems = [];

    // Add root files if they exist
    if (data.root) {
      rootItems.push(...data.root.map(file => ({
        type: 'file',
        name: file
      })));
    }

    // Add directories
    Object.entries(data).forEach(([directory, content]) => {
      if (directory !== 'root') {
        rootItems.push({
          type: 'directory',
          name: directory,
          content: content
        });
      }
    });

    // Sort all items alphabetically
    rootItems.sort((a, b) => sortAlphabetically(a.name, b.name));

    return rootItems.map((item, index) => {
      if (item.type === 'file') {
        const filePath = item.name;
        return (
          <div 
            key={`file-${index}`} 
            className={`file ${activeItem === filePath ? 'active' : ''}`}
            onClick={() => handleFileClick(filePath)}
          >
            {getFileIcon(item.name)}
            <span className="file-name">{item.name}</span>
          </div>
        );
      } else {
        // It's a directory
        return (
          <div key={item.name} className="folder">
            <span 
              className={`folder-name ${activeItem === item.name ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveItem(item.name);
                toggleFolder(item.name);
              }}
            >
              <VscChevronRight className={`arrow ${expandedFolders[item.name] ? 'expanded' : ''}`} />
              <VscFolder className="folder-icon" />
              {item.name}
            </span>
            {expandedFolders[item.name] && (
              <div className="folder-content">
                {Array.isArray(item.content) ? (
                  [...item.content]
                    .sort(sortAlphabetically)
                    .map((file, fileIndex) => {
                      const filePath = `${item.name}/${file}`;
                      return (
                        <div 
                          key={`${item.name}-${fileIndex}`} 
                          className={`file ${activeItem === filePath ? 'active' : ''}`}
                          onClick={() => handleFileClick(filePath)}
                        >
                          {getFileIcon(file)}
                          <span className="file-name">{file}</span>
                        </div>
                      );
                    })
                ) : (
                  // Handle nested directories
                  Object.entries(item.content)
                    .sort(([a], [b]) => sortAlphabetically(a, b))
                    .map(([subDir, subFiles]) => {
                      const subDirPath = `${item.name}/${subDir}`;
                      return (
                        <div key={subDir} className="folder">
                          <span 
                            className={`folder-name ${activeItem === subDirPath ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveItem(subDirPath);
                              toggleFolder(`${item.name}-${subDir}`);
                            }}
                          >
                            <VscChevronRight className={`arrow ${expandedFolders[`${item.name}-${subDir}`] ? 'expanded' : ''}`} />
                            <VscFolder className="folder-icon" />
                            {subDir}
                          </span>
                          {expandedFolders[`${item.name}-${subDir}`] && (
                            <div className="folder-content">
                              {[...subFiles]
                                .sort(sortAlphabetically)
                                .map((file, fileIndex) => {
                                  const filePath = `${item.name}/${subDir}/${file}`;
                                  return (
                                    <div 
                                      key={`${subDir}-${fileIndex}`} 
                                      className={`file ${activeItem === filePath ? 'active' : ''}`}
                                      onClick={() => handleFileClick(filePath)}
                                    >
                                      {getFileIcon(file)}
                                      <span className="file-name">{file}</span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        );
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="file-explorer">
      <div className="folder-structure">
        <div className="folder-header">
          <span className="folder-name" onClick={() => toggleFolder('evaluation')}>
            <VscChevronRight className={`arrow ${expandedFolders['evaluation'] ? 'expanded' : ''}`} />
            <VscFolder className="folder-icon" />
            EVALUATION
          </span>
          <div className="folder-actions">
            <VscNewFile 
              className="action-icon" 
              title="New File" 
              onClick={handleAddFile}
            />
            <VscNewFolder 
              className="action-icon" 
              title="New Folder" 
              onClick={handleAddFolder}
            />
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        {expandedFolders['evaluation'] && (
          <div className="folder-content">
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Form;
