import React, { useState, useEffect } from 'react';
import { fetchData } from './ApiService';
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
  VscPreview
} from 'react-icons/vsc';
import './FileExplorer.css';

function Form() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});

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

  const renderContent = () => {
    if (!data || Object.keys(data).length === 0) return null;

    // Collect all items at root level
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
        return (
          <div key={`file-${index}`} className="file">
            {getFileIcon(item.name)}
            <span className="file-name">{item.name}</span>
          </div>
        );
      } else {
        // It's a directory
        return (
          <div key={item.name} className="folder">
            <span className="folder-name" onClick={() => toggleFolder(item.name)}>
              <VscChevronRight className={`arrow ${expandedFolders[item.name] ? 'expanded' : ''}`} />
              <VscFolder className="folder-icon" />
              {item.name}
            </span>
            {expandedFolders[item.name] && (
              <div className="folder-content">
                {Array.isArray(item.content) ? (
                  // Sort files within directory
                  [...item.content]
                    .sort(sortAlphabetically)
                    .map((file, fileIndex) => (
                      <div key={`${item.name}-${fileIndex}`} className="file">
                        {getFileIcon(file)}
                        <span className="file-name">{file}</span>
                      </div>
                    ))
                ) : (
                  // Handle nested directories
                  Object.entries(item.content)
                    .sort(([a], [b]) => sortAlphabetically(a, b))
                    .map(([subDir, subFiles]) => (
                      <div key={subDir} className="folder">
                        <span className="folder-name" onClick={() => toggleFolder(`${item.name}-${subDir}`)}>
                          <VscChevronRight className={`arrow ${expandedFolders[`${item.name}-${subDir}`] ? 'expanded' : ''}`} />
                          <VscFolder className="folder-icon" />
                          {subDir}
                        </span>
                        {expandedFolders[`${item.name}-${subDir}`] && (
                          <div className="folder-content">
                            {[...subFiles]
                              .sort(sortAlphabetically)
                              .map((file, fileIndex) => (
                                <div key={`${subDir}-${fileIndex}`} className="file">
                                  {getFileIcon(file)}
                                  <span className="file-name">{file}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))
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
        <span className="folder-name" onClick={() => toggleFolder('evaluation')}>
          <VscChevronRight className={`arrow ${expandedFolders['evaluation'] ? 'expanded' : ''}`} />
          <VscFolder className="folder-icon" />
          EVALUATION
        </span>
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
