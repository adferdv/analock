interface Registration {
  registrationDate: number;
  userId: number;
}

interface GameRegistration {
  id: number;
  gameName: string;
  registration: Registration;
}

interface BookRegistration {
  id: number;
  internetArchiveId: string;
  registration: Registration;
}

interface DiaryEntryRegistration {
  id: number;
  title: string;
  content: string;
  registration: Registration;
}

interface AddBookRegistrationRequest {
  internetArchiveId: string;
  registrationDate: number;
}

interface AddGameRegistrationRequest {
  gameName: string;
  registrationDate: number;
}

interface ActivityRegistrationsData {
  activityRegistrations: ActivityRegistration[];
  error: boolean;
}
