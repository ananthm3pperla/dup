interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (config: {
        apiKey: string;
        discoveryDocs: string[];
      }) => Promise<void>;
      calendar: {
        events: {
          list: (params: {
            calendarId: string;
            timeMin: string;
            timeMax: string;
            singleEvents: boolean;
            orderBy: string;
          }) => Promise<{
            result: {
              items: Array<{
                id: string;
                summary: string;
                start: {
                  dateTime?: string;
                  date?: string;
                };
                end: {
                  dateTime?: string;
                  date?: string;
                };
              }>;
            };
          }>;
        };
      };
    };
  };
  google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: {
            access_token: string;
            expires_in: number;
            error?: string;
          }) => void;
        }) => {
          requestAccessToken: () => void;
        };
      };
    };
  };
}