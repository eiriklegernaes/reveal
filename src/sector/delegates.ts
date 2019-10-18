/*!
 * Copyright 2019 Cognite AS
 */

import { LoadSectorRequest } from './loadSector';
import { Sector } from './types';

/**
 * Delegate that handles removal of a sector from a view (e.g. by removing it from the scene).
 */
export type DiscardSectorDelegate = (sectorId: number, request: LoadSectorRequest) => void;

/**
 * Delegate for fetching raw data for the sector given.
 */
export type FetchSectorDelegate = (sectorId: number) => Promise<ArrayBuffer>;

/**
 * Delegate for parsing data retrieved using a `FetchSectorDelegate`  to a `Sector`.
 */
export type ParseSectorDelegate = (sectorId: number, buffer: ArrayBuffer) => Promise<Sector>;

/**
 * Delegate for 'consuming' a sector, e.g. by creating a 3D node for it.
 */
export type ConsumeSectorDelegate = (sectorId: number, sector: Sector) => void;
