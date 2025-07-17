
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImportPreviewProps {
  data: any[][];
}

export function ImportPreview({ data }: ImportPreviewProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const headers = data[0];
  const rows = data.slice(1);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Prévisualisation des données</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto border rounded-lg h-96">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gray-50">
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index}>{header || `Colonne ${index + 1}`}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>{row[cellIndex]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
