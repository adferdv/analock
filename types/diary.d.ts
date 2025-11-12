interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  registration: Registration;
}

interface DiaryEntriesData {
  diaryEntries: DiaryEntry[];
  error?: string;
}

interface AddDiaryEntryRequest {
  title: string;
  content: string;
  publishDate: number;
}

interface UpdateDiaryEntryRequest {
  title: string;
  content: string;
  publishDate: number;
}
