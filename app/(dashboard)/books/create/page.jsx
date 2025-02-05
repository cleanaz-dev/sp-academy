"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBookReport } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { CreateBookReportButton } from "@/components/SubmitButton";
import debounce from "lodash/debounce";
import { Spinner } from "@/components/ui/spinner";

export default function CreateBookReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const [searchLanguage, setSearchLanguage] = useState("en");

  const [searchResults, setSearchResults] = useState([]);
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    pages: "",
    description: "",
    coverUrl: "",
    mainCategory: "",
  });
  const [isSearching, setIsSearching] = useState(false);

  const searchBooks = debounce(async (query) => {
    if (!query) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(
          query
        )}&lang=${searchLanguage}`
      );
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleBookSelect = (book) => {
    const volumeInfo = book.volumeInfo;
    setBookData({
      title: volumeInfo.title || "",
      author: volumeInfo.authors ? volumeInfo.authors[0] : "",
      pages: volumeInfo.pageCount || "",
      description: volumeInfo.description || "",
      coverUrl: volumeInfo.imageLinks?.thumbnail || "",
      mainCategory:
        volumeInfo.mainCategory || volumeInfo.categories?.[0] || "Other",
    });
    setSearchResults([]);
  };

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    try {
      // Create a new FormData object
      const form = new FormData();

      // Add all the fields
      form.append("userId", user.id);
      form.append("title", bookData.title);
      form.append("author", bookData.author);
      form.append("genre", formData.get("genre")); // If this comes from the form
      form.append("language", formData.get("language")); // If this comes from the form
      form.append("pages", bookData.pages);
      form.append("description", bookData.description);
      form.append("coverUrl", bookData.coverUrl);

      await createBookReport(form);
      router.push("/books");
    } catch (error) {
      console.error("Failed to create book report:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl pt-2 pb-8 px-4 sm:px-6 mx-auto">
      <header className="pb-4">
        <h1 className="header-title">Create </h1>
      </header>

      <Card className="relative overflow-hidden w-full max-w-lg mx-auto">
        {/* Decorative rings inside the card */}
        <div className="absolute -top-6 left-24 w-10 h-10 border-4 border-sky-400 rounded-full z-0"></div>
        <div className="absolute bottom-36 -right-12 w-16 h-16 border-4 border-emerald-400 rounded-full z-0"></div>
        <div className="absolute top-36 -left-12 w-16 h-16 border-4 border-amber-400 rounded-full z-0"></div>
        <div className="absolute -bottom-8 left-1/2 w-12 h-12 border-4 border-violet-400 rounded-full z-0"></div>
        <CardHeader className="relative z-10">
          <CardTitle>Create New Book Report</CardTitle>
        </CardHeader>
        <form action={handleSubmit}>
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="coverUrl" value={bookData.coverUrl} />
          <CardContent className="space-y-4 relative z-10">
            {/* Book Search Section */}
            {/* Search Language */}
            <div className="space-y-2">
              <Label>Search Language</Label>
              <Select
                name="language"
                value={searchLanguage}
                onValueChange={setSearchLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select search language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookSearch">Search for a book</Label>
              <div className="relative">
                <Input
                  id="bookSearch"
                  placeholder="Start typing to search books..."
                  onChange={(e) => searchBooks(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Spinner />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-20 bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-auto w-full">
                  {searchResults.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleBookSelect(book)}
                    >
                      {book.volumeInfo.imageLinks?.thumbnail && (
                        <img
                          src={book.volumeInfo.imageLinks.thumbnail}
                          alt={book.volumeInfo.title}
                          className="w-12 h-16 object-cover mr-2"
                        />
                      )}
                      <div>
                        <div className="font-semibold">
                          {book.volumeInfo.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {book.volumeInfo.authors?.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Book Cover Preview */}
            {bookData.coverUrl && (
              <div className="flex justify-center">
                <img
                  src={bookData.coverUrl}
                  alt="Book cover"
                  className="w-32 h-48 object-cover rounded-md shadow-md"
                />
              </div>
            )}
            {/* Book Information */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                value={bookData.title}
                onChange={(e) =>
                  setBookData({ ...bookData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                name="author"
                value={bookData.author}
                onChange={(e) =>
                  setBookData({ ...bookData, author: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                name="pages"
                value={bookData.pages}
                onChange={(e) =>
                  setBookData({ ...bookData, pages: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                name="genre"
                value={bookData.mainCategory}
                onChange={(e) =>
                  setBookData({ ...bookData, mainCategory: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={bookData.description}
                onChange={(e) =>
                  setBookData({ ...bookData, description: e.target.value })
                }
                rows={6}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="relative z-10">
            <CreateBookReportButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
