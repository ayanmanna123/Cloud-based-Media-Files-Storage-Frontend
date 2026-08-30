/**
 * Centralized Access Control & Permissions Module for Cloud Storage.
 * Defines feature access for the 4 user roles:
 * - 'owner': Full control (view, download, edit, rename, delete, share, move, version history, hide)
 * - 'editor': Shared write access (view, download, edit, rename, delete, version history)
 * - 'viewer': Shared read-only access (view, download, copy link)
 * - 'guest': Public share view access (view, download as guest)
 */

export const USER_ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  GUEST: 'guest'
};

/**
 * Resolves the effective role for a file or folder in a specific view context.
 * @param {Object} item - File or Folder object
 * @param {string} [currentView='root'] - Current dashboard view ('root', 'shared', 'recent', 'starred', 'trash', 'secret', etc.)
 * @param {boolean} [isSharedProp=false] - Explicit shared flag
 * @param {Object|null} [user=null] - Current authenticated user
 * @returns {string} One of USER_ROLES ('owner', 'editor', 'viewer', 'guest')
 */
export function getEffectiveRole(item, currentView = 'root', isSharedProp = false, user = null) {
  if (!user && (currentView === 'public' || item?.isPublicShare)) {
    return USER_ROLES.GUEST;
  }

  const rawRole = item?.permission || item?.role;
  if (rawRole === USER_ROLES.OWNER) return USER_ROLES.OWNER;
  if (rawRole === USER_ROLES.EDITOR) return USER_ROLES.EDITOR;
  if (rawRole === USER_ROLES.VIEWER) return USER_ROLES.VIEWER;

  if (typeof isSharedProp === 'string') {
    if (isSharedProp === USER_ROLES.OWNER) return USER_ROLES.OWNER;
    if (isSharedProp === USER_ROLES.EDITOR) return USER_ROLES.EDITOR;
    if (isSharedProp === USER_ROLES.VIEWER) return USER_ROLES.VIEWER;
  }

  if (isSharedProp || currentView === 'shared' || item?.sharedWithMe) {
    return USER_ROLES.VIEWER;
  }

  return USER_ROLES.OWNER;
}

/**
 * Computes feature permissions object for an item or role.
 * @param {Object|string} itemOrRole - File/Folder object OR role string ('owner', 'editor', 'viewer', 'guest')
 * @param {string} [currentView='root']
 * @param {boolean} [isSharedProp=false]
 * @param {Object|null} [user=null]
 * @returns {Object} Permissions map
 */
export function getItemPermissions(itemOrRole, currentView = 'root', isSharedProp = false, user = null) {
  const role = typeof itemOrRole === 'string'
    ? itemOrRole
    : getEffectiveRole(itemOrRole, currentView, isSharedProp, user);

  const isOwner = role === USER_ROLES.OWNER;
  const isEditor = role === USER_ROLES.EDITOR;
  const isViewer = role === USER_ROLES.VIEWER;
  const isGuest = role === USER_ROLES.GUEST;

  return {
    role,
    isOwner,
    isEditor,
    isViewer,
    isGuest,

    // Access Feature Flags
    canView: true,
    canDownload: true,
    canCopyLink: true,
    canPreview: true,

    canEditContent: isOwner || isEditor,
    canRename: isOwner || isEditor,
    canDelete: isOwner || isEditor,       // Enabled for Editor and Owner; Disabled for Viewer
    canVersionHistory: isOwner || isEditor,
    canToggleHide: !isGuest,              // Independent personal vault feature; enabled for Owner, Editor, Viewer
    canMakeCopy: !isGuest,                // Enabled for Owner, Editor, and Viewer

    canShare: isOwner,                    // Only owner can manage shares
    canMove: isOwner,                     // Only owner can move root item
    canStar: !isGuest
  };
}

/**
 * Computes aggregate permissions for bulk selected items.
 * @param {Array<string>} selectedItemsKeys - Array of item keys (e.g. ['file_123', 'folder_456'])
 * @param {Object} [children={ folders: [], files: [] }] - Folder contents
 * @param {string} [currentView='root']
 * @param {boolean} [isSharedFolder=false]
 * @param {Object|null} [user=null]
 * @returns {Object} Bulk permissions map
 */
export function getBulkPermissions(selectedItemsKeys = [], children = { folders: [], files: [] }, currentView = 'root', isSharedFolder = false, user = null) {
  if (!selectedItemsKeys || selectedItemsKeys.length === 0) {
    const defaultRole = (isSharedFolder || currentView === 'shared') ? USER_ROLES.VIEWER : USER_ROLES.OWNER;
    return getItemPermissions(defaultRole);
  }

  const items = selectedItemsKeys.map(key => {
    const [type, id] = key.split('_');
    return type === 'folder'
      ? children?.folders?.find(f => f.id === id)
      : children?.files?.find(f => f.id === id);
  }).filter(Boolean);

  const permissionsList = items.map(item => getItemPermissions(item, currentView, isSharedFolder, user));

  const canShare = !isSharedFolder && permissionsList.every(p => p.canShare);
  const canMove = !isSharedFolder && permissionsList.every(p => p.canMove);
  const canDelete = permissionsList.length > 0 && permissionsList.every(p => p.canDelete);

  return {
    canDownload: true,
    canShare,
    canMove,
    canDelete
  };
}
