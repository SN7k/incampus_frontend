import { useState } from 'react';
import usePosts from '../hooks/usePosts';

const CreatePost = () => {
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPost } = usePosts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    setIsSubmitting(true);
    try {
      await createPost(text, media);
      setText('');
      setMedia(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded-lg mb-4 resize-none"
          rows="3"
          disabled={isSubmitting}
        />
        
        <div className="flex items-center justify-between">
          <div>
            <label className="cursor-pointer text-blue-500 hover:text-blue-600">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="hidden"
                disabled={isSubmitting}
              />
              {media ? 'Change Media' : 'Add Media'}
            </label>
            {media && (
              <span className="ml-2 text-sm text-gray-500">
                {media.name}
              </span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || (!text.trim() && !media)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 