
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GoogleSpreadsheet, SheetInfo } from '@/hooks/useGoogleSheets';

interface ImportSelectionFormProps {
  spreadsheets: GoogleSpreadsheet[];
  selectedSpreadsheet: string;
  setSelectedSpreadsheet: (value: string) => void;
  sheetInfo: SheetInfo | null;
  selectedSheet: string;
  setSelectedSheet: (value: string) => void;
  range: string;
  setRange: (value: string) => void;
  module: string;
  setModule: (value: string) => void;
}

export function ImportSelectionForm({
  spreadsheets,
  selectedSpreadsheet,
  setSelectedSpreadsheet,
  sheetInfo,
  selectedSheet,
  setSelectedSheet,
  range,
  setRange,
  module,
  setModule,
}: ImportSelectionFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="spreadsheet">Feuille Google Sheets</Label>
        <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une feuille" />
          </SelectTrigger>
          <SelectContent>
            {spreadsheets.map((sheet) => (
              <SelectItem key={sheet.id} value={sheet.id}>
                {sheet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="sheet">Onglet</Label>
        <Select value={selectedSheet} onValueChange={setSelectedSheet}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un onglet" />
          </SelectTrigger>
          <SelectContent>
            {sheetInfo?.sheets.map((sheet) => (
              <SelectItem key={sheet.properties.sheetId} value={sheet.properties.title}>
                {sheet.properties.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="range">Plage de cellules</Label>
        <Input
          id="range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          placeholder="A1:Z1000"
        />
      </div>

      <div>
        <Label htmlFor="module">Module de destination</Label>
        <Select value={module} onValueChange={setModule}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">📈 Sales</SelectItem>
            <SelectItem value="marketing">📊 Marketing</SelectItem>
            <SelectItem value="financial">💸 Financier</SelectItem>
            <SelectItem value="profits">💰 Profits</SelectItem>
            <SelectItem value="ad-spending">📊 Dépenses Publicitaires</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
