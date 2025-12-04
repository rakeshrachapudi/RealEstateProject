// src/config/rolePermissions.js
// ✅ Role-Based Deal Permissions Configuration

/**
 * User Roles in PropertyDealz System
 * Note: USER role serves as both SELLER (property owner) and BUYER
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  BROKER: 'BROKER',
  USER: 'USER'  // Serves as both SELLER and BUYER
};

/**
 * Deal Creation Permissions
 * Only ADMIN and AGENT can create deals
 */
export const canCreateDeal = (userRole) => {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.AGENT;
};

/**
 * Deal View Permissions
 * Check if user can view a specific deal
 *
 * @param {Object} user - Current logged-in user
 * @param {Object} deal - Deal object to check permissions for
 * @param {Object} property - Property associated with the deal
 * @returns {boolean} - True if user can view the deal
 */
export const canViewDeal = (user, deal, property) => {
  if (!user || !deal) return false;

  // Admin can view all deals
  if (user.role === USER_ROLES.ADMIN) {
    return true;
  }

  // Agent can view deals they created or are assigned to
  if (user.role === USER_ROLES.AGENT) {
    return deal.agentId === user.id || deal.createdBy === user.id;
  }

  // USER can view if they are:
  // 1. The buyer in the deal
  // 2. The seller (property owner) of the property
  if (user.role === USER_ROLES.USER) {
    const isBuyer = deal.buyerId === user.id;
    const isSeller = property?.userId === user.id || property?.user?.id === user.id;
    return isBuyer || isSeller;
  }

  // Broker can view if they are assigned to the deal
  if (user.role === USER_ROLES.BROKER) {
    return deal.brokerId === user.id;
  }

  // Property owner can view deals on their property
  if (property?.userId === user.id || property?.user?.id === user.id) {
    return true;
  }

  return false;
};

/**
 * Deal Modification Permissions
 * Check if user can modify/update a deal
 */
export const canModifyDeal = (userRole, deal, userId) => {
  // Admin can modify all deals
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  // Agent can modify their own deals
  if (userRole === USER_ROLES.AGENT) {
    return deal.agentId === userId || deal.createdBy === userId;
  }

  // Others cannot modify
  return false;
};

/**
 * Property Owner Check
 * Verify if user is the owner of the property
 */
export const isPropertyOwner = (user, property) => {
  if (!user || !property) return false;
  return user.id === property.userId || user.id === property.user?.id;
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.AGENT]: 'Agent',
    [USER_ROLES.BROKER]: 'Broker',
    [USER_ROLES.USER]: 'User'
  };
  return roleNames[role] || role;
};

/**
 * Get role-based UI messages
 */
export const getRoleMessage = (role) => {
  const messages = {
    [USER_ROLES.ADMIN]: 'As an administrator, you have full access to create and manage deals.',
    [USER_ROLES.AGENT]: 'As an agent, you can create deals for buyers on this property.',
    [USER_ROLES.BROKER]: 'As a broker, you can view deals but cannot create new ones.',
    [USER_ROLES.USER]: 'As a user, you can make offers on properties you\'re interested in.'
  };
  return messages[role] || '';
};

export default {
  USER_ROLES,
  canCreateDeal,
  canViewDeal,
  canModifyDeal,
  isPropertyOwner,
  getRoleDisplayName,
  getRoleMessage
};