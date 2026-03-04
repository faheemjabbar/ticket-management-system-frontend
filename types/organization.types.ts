// Base organization reference (used in nested objects)
export interface OrganizationRef {
  id: string;
  name: string;
  isActive?: boolean;  // Optional for backward compatibility
}

// Full organization entity
export interface Organization extends OrganizationRef {
  description: string;
  createdBy: string;
  isActive: boolean;  // Required in full entity
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
}
