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
import { LibraryBig } from "lucide-react";

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
          query,
        )}&lang=${searchLanguage}`,
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
    <div className=" ">
      <header className="mb-8 animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold">
            Books{" "}
            <LibraryBig strokeWidth={1.5} className="size-10 drop-shadow-xl" />
          </h1>
          <p className="text-xl opacity-90">
            Dive into a world of knowledge and let every page inspire your
            journey. Together, let's unlock new adventures and endless
            possibilities!
          </p>
        </div>
      </header>
      <div className="">
        <Card className="relative w-full max-w-4xl overflow-hidden">
          {/* Decorative rings inside the card */}
          <div className="absolute -top-6 left-24 z-0 h-10 w-10 rounded-full border-4 border-sky-400"></div>
          <div className="absolute -right-12 bottom-36 z-0 h-16 w-16 rounded-full border-4 border-emerald-400"></div>
          <div className="absolute -left-12 top-36 z-0 h-16 w-16 rounded-full border-4 border-amber-400"></div>
          <div className="absolute -bottom-8 left-1/2 z-0 h-12 w-12 rounded-full border-4 border-violet-400"></div>

          <CardHeader className="relative z-10">
            <CardTitle>Add a new book 😎✌🏼📚</CardTitle>
          </CardHeader>

          <form action={handleSubmit}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="coverUrl" value={bookData.coverUrl} />

            <CardContent className="relative z-10 space-y-6">
              {/* Top Section: Search + Image */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Left Column: Search and Details */}
                <div className="col-span-2 space-y-6">
                  {/* Book Search Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                      {/* Book Search Input */}
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
                      </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg md:w-2/3">
                        {searchResults.map((book) => (
                          <div
                            key={book.id}
                            className="flex cursor-pointer items-center p-2 hover:bg-gray-100"
                            onClick={() => handleBookSelect(book)}
                          >
                            {book.volumeInfo.imageLinks?.thumbnail && (
                              <img
                                src={book.volumeInfo.imageLinks.thumbnail}
                                alt={book.volumeInfo.title}
                                className="mr-2 h-16 w-12 object-cover"
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

                  {/* Book Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            setBookData({
                              ...bookData,
                              mainCategory: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Book Image */}
                <div className="col-span-1 flex justify-center md:justify-end">
                  <div className="w-full max-w-[200px] rounded-md border border-dashed border-gray-200 bg-gray-50 p-4">
                    {bookData.coverUrl ? (
                      <img
                        src={bookData.coverUrl}
                        alt="Book cover"
                        className="h-auto w-full rounded-md object-cover shadow-md"
                      />
                    ) : (
                      <p className="text-center text-sm text-gray-500">
                        Book cover preview
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Full-width Description */}
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
                  className="w-full"
                />
              </div>
            </CardContent>

            <CardFooter className="relative z-10">
              <CreateBookReportButton />
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
