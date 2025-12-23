export interface DbErrorMetadata {
  readonly column?: string;
  readonly constraint?: string;
  readonly table?: string;
}

export interface PgErrorMetadataBase extends DbErrorMetadata {
  readonly pgCode: string;
}

export interface PgErrorMetadata extends PgErrorMetadataBase {
  readonly datatype?: string;
  readonly detail?: string;
  readonly hint?: string;
  readonly position?: string;
  readonly schema?: string;
  readonly severity?: string;
  readonly where?: string;
}
