export interface GitHubIssue {
  id: string;
  title: string;
  number: string;
  html_url: string;
  created_at: string;
  user: { login: string };
  pull_request: {};
}
