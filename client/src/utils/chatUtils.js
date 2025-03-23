export const renderMessageContent = (msg) => {
  try {
    const content = JSON.parse(msg.content);
    if (content.type === 'image') {
      return <img src={`${process.env.REACT_APP_ASSETS_URL}${content.path}`} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '200px' }} />;
    } else if (content.type === 'video') {
      return <video src={`${process.env.REACT_APP_ASSETS_URL}${content.path}`} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />;
    } else if (content.type === 'audio') {
      return <audio src={`${process.env.REACT_APP_ASSETS_URL}${content.path}`} controls />;
    } else {
      return <a href={`${process.env.REACT_APP_ASSETS_URL}${content.path}`} target="_blank" rel="noopener noreferrer" style={{color: '#00FF7F', textDecoration: 'underline'}}>Download Attachment</a>;
    }
  } catch (error) {
    return <p>{msg.content}</p>;
  }
};
