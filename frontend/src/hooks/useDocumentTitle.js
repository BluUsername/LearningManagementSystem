import { useEffect } from 'react';

function useDocumentTitle(pageName) {
  useEffect(() => {
    document.title = `${pageName} | LearnHub`;
  }, [pageName]);
}

export default useDocumentTitle;
