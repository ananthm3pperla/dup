export type TabType = 'experience' | 'education' | 'team' | 'activity';

export interface TabComponentProps {
  profile: Employee;
  canEdit?: boolean;
  isSaving?: boolean;
  onAdd?: () => void;
  onSave?: (index: number, data: any) => void;
  onDelete?: (index: number) => void;
  onNodeClick?: (id: string) => void;
}