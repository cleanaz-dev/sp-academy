// components/books/Bookshelf.jsx
"use client"

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

const Bookshelf = ({ books }) => {
  const [selectedBook, setSelectedBook] = useState(null);

  // Split books into rows of 3
  const bookRows = [];
  for (let i = 0; i < books.length; i += 3) {
    bookRows.push(books.slice(i, i + 3));
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Bookshelves */}
      <div className="space-y-16">
        {bookRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="relative"
          >
            {/* Shelf */}
            <div className="flex justify-around items-end h-64 relative">
              {row.map((book) => (
                <motion.div
                  key={book.id}
                  className="cursor-pointer"
                  whileHover={{ y: -20 }}
                  onClick={() => setSelectedBook(book)}
                >
                  {/* Book spine/cover */}
                  <div className="w-32 h-48 relative">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover rounded-sm shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm shadow-lg flex items-center justify-center p-2">
                        <span className="text-white text-sm text-center">
                          {book.title}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Wooden shelf */}
            <div className="h-4 bg-gradient-to-r from-brown-800 to-brown-600 rounded-sm shadow-md" />
          </div>
        ))}
      </div>

      {/* Book Details Panel */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 bg-white p-6 shadow-lg rounded-t-xl"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-6">
                <div className="w-32">
                  {selectedBook.coverUrl && (
                    <Image
                      src={selectedBook.coverUrl}
                      alt={selectedBook.title}
                      width={128}
                      height={192}
                      className="rounded-md shadow-md"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedBook.title}</h2>
                  <p className="text-gray-600">{selectedBook.author}</p>
                  <p className="mt-4">{selectedBook.description}</p>
                  {/* Add more book details as needed */}
                </div>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-4 right-4"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookshelf;