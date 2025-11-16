import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/old-ui/tabs";
import React from "react";

export const ConjugationTableWrapper = ({ tables }) => {
  if (!tables || tables.length === 0) {
    return (
      <p className="text-lg italic text-gray-500">
        No conjugation tables provided.
      </p>
    );
  }

  return (
    <div className="mx-auto my-8 max-w-2xl">
      <div className="rounded-xl bg-white p-6">
        <Tabs defaultValue={tables[0].verbs[0]} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            {tables.map((table) => (
              <TabsTrigger
                key={table.verbs[0]}
                value={table.verbs[0]}
                className="font-serif text-lg font-bold text-gray-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 data-[state=active]:text-blue-700"
              >
                {table.verbs[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          {tables.map((table) => (
            <TabsContent key={table.verbs[0]} value={table.verbs[0]}>
              <ConjugationTable
                verbs={table.verbs}
                tense={table.tense}
                conjugation={table.conjugation}
                englishTranslations={table.englishTranslations}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
