// supabase.js
// Create Supabase client
const SUPABASE_URL = 'https://joldfwuwuohaklcalzpa.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_m4NRbbm6m4TpSpZCfdp4nA_kQCOnVjy'

// Initialize Supabase client
window.supabase = (function() {
  // Always use real Supabase client to avoid app.current_admin_id issues
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    // Create the client without any problematic settings
    const { createClient } = window.supabase;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      // Ensure no custom parameters that might cause issues
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client': 'parasite-project'
        }
      },
      db: {
        // Custom query functions if needed
      }
    });
  } else {
    console.error('Supabase CDN not loaded properly');
    
    // Create a mock client for development/testing purposes
    return {
      from: function(table) {
        return {
          select: function(fields = '*') {
            return {
              order: function(field, options) {
                return {
                  eq: function(field, value) {
                    return {
                      single: function() {
                        // Mock data for different tables
                        if (table === 'articles') {
                          return { data: getMockArticle(), error: null };
                        } else if (table === 'images') {
                          return { data: getMockGalleryItem(), error: null };
                        } else if (table === 'admins') {
                          // Mock admin check - return a valid admin record
                          if (value === 'mock-admin-id') {
                            return { data: [{ user_id: 'mock-admin-id', is_admin: true }], error: null };
                          } else {
                            return { data: [], error: null };
                          }
                        }
                        return { data: [], error: null };
                      },
                      then: function(callback) {
                        // Mock data for different tables
                        if (table === 'articles') {
                          return callback({ data: getMockArticles(), error: null });
                        } else if (table === 'images') {
                          return callback({ data: getMockGalleryItems(), error: null });
                        } else if (table === 'admins') {
                          // Mock admin check - return a valid admin record
                          if (value === 'mock-admin-id') {
                            return callback({ data: [{ user_id: 'mock-admin-id', is_admin: true }], error: null });
                          } else {
                            return callback({ data: [], error: null });
                          }
                        }
                        return callback({ data: [], error: null });
                      }
                    };
                  },
                  then: function(callback) {
                    // Mock data for different tables
                    if (table === 'articles') {
                      return callback({ data: getMockArticles(), error: null });
                    } else if (table === 'images') {
                      return callback({ data: getMockGalleryItems(), error: null });
                    } else if (table === 'admins') {
                      // Mock admin check - return a valid admin record
                      if (value === 'mock-admin-id') {
                        return callback({ data: [{ user_id: 'mock-admin-id', is_admin: true }], error: null });
                      } else {
                        return callback({ data: [], error: null });
                      }
                    }
                    return callback({ data: [], error: null });
                  }
                };
              }
            };
          },
          insert: function(data) {
            return {
              then: function(callback) {
                // Add ID to the inserted data if it doesn't have one
                const now = new Date().toISOString();
                const result = Array.isArray(data) ? 
                  data.map(item => ({
                    id: item.id || `mock-id-${Date.now()}-${Math.random()}`,
                    created_at: now,
                    ...item
                  })) : 
                  [{
                    id: data.id || `mock-id-${Date.now()}-${Math.random()}`,
                    created_at: now,
                    ...data
                  }];
                return callback({ data: result, error: null });
              }
            };
          },
          update: function(data) {
            return {
              eq: function(field, value) {
                return {
                  then: function(callback) {
                    return callback({ data: data, error: null });
                  }
                };
              }
            };
          },
          delete: function() {
            return {
              eq: function(field, value) {
                return {
                  then: function(callback) {
                    return callback({ error: null });
                  }
                };
              }
            };
          }
        };
      },
      storage: {
        from: function(folder) {
          return {
            upload: function(fileName, file, options) {
              return {
                then: function(callback) {
                  return callback({ data: { path: fileName }, error: null });
                }
              };
            },
            getPublicUrl: function(fileName) {
              return {
                data: { publicUrl: `https://mock-url.com/${fileName}` },
                error: null
              };
            }
          };
        }
      },
      auth: {
        signInWithPassword: function(credentials) {
          return {
            then: function(callback) {
              // Check for specific admin credentials
              if (credentials.email === 'atevs@gmail.com' && credentials.password === 'atevs777') {
                // Set mock session for admin
                window._mockSession = { user: { id: 'mock-admin-id' } };
                return callback({ data: { user: { id: 'mock-admin-id' }, session: window._mockSession }, error: null });
              } else {
                return callback({ data: null, error: { message: 'Invalid credentials' } });
              }
            }
          };
        },
        signOut: function() {
          return {
            then: function(callback) {
              // Clear mock session
              window._mockSession = null;
              return callback({ error: null });
            }
          };
        },
        getUser: function() {
          // Check if we have a logged-in user by checking session
          const mockSession = window._mockSession || null;
          if (mockSession && mockSession.user) {
            return {
              data: { user: mockSession.user }
            };
          } else {
            return {
              data: { user: null }
            };
          }
        }
      }
    };
    
    // Mock data helper functions
    function getMockArticles() {
      return [
        {
          id: 1,
          title: "Пример статьи о мошенничестве",
          category: "fraud_schemes",
          excerpt: "Это пример статьи о мошеннических схемах. В реальной системе здесь будут данные из базы данных.",
          content: "<p>Это демонстрационный контент. В реальной системе здесь будет полный текст статьи о мошеннических схемах.</p>",
          author: "Администратор",
          created_at: new Date().toISOString(),
          views: 10,
          image_url: "https://via.placeholder.com/400x200?text=Article+Image",
          tags: "мошенничество, защита, безопасность"
        },
        {
          id: 2,
          title: "Психологические аспекты мошенничества",
          category: "psychology",
          excerpt: "Изучение психологических методов, используемых мошенниками для манипуляции жертвами.",
          content: "<p>Психологические аспекты мошенничества играют важную роль в успехе преступлений.</p>",
          author: "Администратор",
          created_at: new Date().toISOString(),
          views: 15,
          image_url: "https://via.placeholder.com/400x200?text=Psychology+Image",
          tags: "психология, манипуляции, мошенничество"
        }
      ];
    }
    
    function getMockArticle() {
      return {
        id: 1,
        title: "Пример статьи о мошенничестве",
        category: "fraud_schemes",
        excerpt: "Это пример статьи о мошеннических схемах. В реальной системе здесь будут данные из базы данных.",
        content: "<p>Это демонстрационный контент. В реальной системе здесь будет полный текст статьи о мошеннических схемах.</p>",
        author: "Администратор",
        created_at: new Date().toISOString(),
        views: 10,
        image_url: "https://via.placeholder.com/400x200?text=Article+Image",
        tags: "мошенничество, защита, безопасность"
      };
    }
    
    function getMockGalleryItems() {
      return [];
    }
    
    function getMockGalleryItem() {
      return null;
    }
  }
})();

// --- Auth functions ---
async function loginAdmin(email, password) {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const { data, error } = await window.supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  
  // Check if user is an admin
  const isAdmin = await checkAdminStatus(data.user.id);
  if (!isAdmin) {
    throw new Error('User is not authorized as admin');
  }
  
  return data
}

async function logoutAdmin() {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const { error } = await window.supabase.auth.signOut()
  if (error) throw error
}

// --- Admin check ---
async function checkAdminStatus(userId) {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    // Query the admins table for the user
    const { data, error } = await window.supabase
      .from('admins')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error querying admin status:', error);
      return false;
    }
    
    // Check if any records were returned
    if (!data || data.length === 0) {
      console.log('User not found in admins table');
      return false; // User is not in the admins table
    }
    
    // Check if the user is an admin based on the is_admin field
    // If the field doesn't exist or is not true, return false
    const adminRecord = data[0];
    if (adminRecord.is_admin !== undefined) {
      return adminRecord.is_admin === true;
    } else {
      // If is_admin field doesn't exist, just check if the record exists
      return true;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// --- Check current user admin status ---
async function getCurrentUserAdminStatus() {
  if (!window.supabase) {
    // Development fallback when Supabase is unavailable
    console.log('Supabase not initialized, returning admin status as true for development');
    return true;
  }
  
  const {
    data: { user },
  } = await window.supabase.auth.getUser();
  
  if (!user) return false;
  
  return await checkAdminStatus(user.id);
}

// --- Articles ---
async function getArticles() {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  console.log('Fetching articles from Supabase...');
  const { data, error } = await window.supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  
  console.log('Articles fetched:', data);
  return data
}

async function getArticleById(id) {
  if (!window.supabase) {
    console.warn('Supabase client not initialized, using fallback');
    // Fallback for when Supabase is not available
    // This is just a fallback to avoid breaking the functionality
    return {
      id: id,
      title: "Статья", 
      category: "general",
      excerpt: "Пример статьи",
      content: "<p>Содержимое статьи</p>",
      author: "Администратор",
      created_at: new Date().toISOString(),
      views: 1,
      image_url: "",
      tags: ""
    };
  }
  
  console.log('Fetching article by ID:', id);
  const { data, error } = await window.supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    console.error('Error fetching article by ID:', error);
    throw error;
  }
  console.log('Article fetched by ID:', data);
  
  // Increment the view count
  try {
    const { error: updateError } = await window.supabase
      .from('articles')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating article views:', updateError);
      // Return data with incremented view count on the frontend as fallback
      return { ...data, views: (data.views || 0) + 1 };
    } else {
      console.log('Article views updated successfully');
      return data;
    }
  } catch (updateError) {
    console.error('Exception updating article views:', updateError);
    // Return data with incremented view count on the frontend as fallback
    return { ...data, views: (data.views || 0) + 1 };
  }
}

async function getGalleryItemById(id) {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  console.log('Fetching gallery item by ID:', id);
  const { data, error } = await window.supabase
    .from('images')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    console.error('Error fetching gallery item by ID:', error);
    throw error;
  }
  console.log('Gallery item fetched by ID:', data);
  return data
}

async function saveArticle(article, imageFile = null) {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  console.log('IMAGE FILE:', imageFile);
  
  // If there's an image file, upload it first
  let imageUrl = article.image_url;
  if (imageFile) {
    imageUrl = await uploadFile(imageFile);
  }
  
  console.log('IMAGE URL:', imageUrl);
  
  if (article.id) {
    // Check if user is an admin before allowing update
    const isAdmin = await getCurrentUserAdminStatus();
    console.log('Admin status for update article:', isAdmin);
    if (!isAdmin) {
      throw new Error('Admin authentication required for updating articles');
    }
    
    console.log('Updating existing article with ID:', article.id);
    const { data, error } = await window.supabase
      .from('articles')
      .update({
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        tags: article.tags,
        image_url: imageUrl
      })
      .eq('id', article.id)
    console.log('Update operation result:', { data, error });
    if (error) {
      console.error('Error updating article:', error);
      throw error;
    }
    console.log('Article updated successfully:', data);
    return data
  } else {
    console.log('Creating new article');
    const { data, error } = await window.supabase
      .from('articles')
      .insert([{
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        tags: article.tags,
        image_url: imageUrl
      }])
    if (error) {
      console.error('Error creating article:', error);
      throw error;
    }
    console.log('Article created successfully:', data);
    return data
  }
}

async function deleteArticle(id) {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // Check if user is an admin before allowing deletion
  const isAdmin = await getCurrentUserAdminStatus();
  console.log('Admin status for delete article:', isAdmin);
  if (!isAdmin) {
    throw new Error('Admin authentication required for deleting articles');
  }
  
  const { error, data } = await window.supabase.from('articles').delete().eq('id', id)
  console.log('Delete operation result:', { error, data });
  if (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
  console.log('Article deleted successfully:', id);
}

// --- Gallery ---
async function getGallery({ category } = {}) {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  let query = window.supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false });  // Show newest items first
  
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
  
  // Sort by created_at descending to show newest items first
  // If no created_at field exists, maintain original order
  if (data && Array.isArray(data)) {
    return data.sort((a, b) => {
      // Try to sort by created_at first, then by display_order
      const dateA = new Date(a.created_at || a.display_order || 0);
      const dateB = new Date(b.created_at || b.display_order || 0);
      return dateB - dateA; // Descending order (newest first)
    });
  }
  
  return data
}

async function saveGalleryItem(item, imageFile = null) {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // Check if user is an admin before any database operation
  const isAdmin = await getCurrentUserAdminStatus();
  if (!isAdmin) {
    throw new Error('Admin authentication required for gallery operations');
  }
  
  // If there's an image file, upload it first
  let imageUrl = item.image_url;
  if (imageFile) {
    imageUrl = await uploadFile(imageFile);
  }
  
  // Create clean item object without description field to avoid schema errors
  const cleanItem = {
    title: item.title,
    category: item.category,
    display_order: item.display_order,
    image_url: imageUrl,
    created_at: new Date().toISOString()  // Add timestamp for sorting
  };
  
  if (item.id) {
    // Update existing item
    const { data, error } = await window.supabase
      .from('images')
      .update(cleanItem)
      .eq('id', item.id)
    if (error) {
      console.error('Error updating gallery item:', error);
      console.error('RLS Policy Error - Check Supabase RLS configuration for the images table');
      throw error;
    }
    return data
  } else {
    // Insert new item
    const { data, error } = await window.supabase
      .from('images')
      .insert([cleanItem])
    if (error) {
      console.error('Error creating gallery item:', error);
      console.error('RLS Policy Error - Check Supabase RLS configuration for the images table');
      throw error;
    }
    return data
  }
}

async function deleteGalleryItem(id) {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // Check if user is an admin before allowing deletion
  const isAdmin = await getCurrentUserAdminStatus();
  if (!isAdmin) {
    throw new Error('Admin authentication required for deleting gallery items');
  }
  
  const { error, data } = await window.supabase.from('images').delete().eq('id', id)
  if (error) {
    console.error('Error deleting gallery item:', error);
    throw error;
  }
  console.log('Gallery item deleted successfully:', id);
  return data
}

// --- File Upload to Supabase Storage ---
async function uploadFile(file, folder = 'images') {
  if (!window.supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // Validate file type to prevent malicious uploads
  if (file && file.type) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }
  }
  
  const fileName = `${Date.now()}_${file.name}`
  const { data, error } = await window.supabase.storage
    .from(folder)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })
  
  if (error) {
    console.error('Upload error:', error);
    throw error;
  }
  
  const { data: urlData, error: urlError } = window.supabase.storage
    .from(folder)
    .getPublicUrl(fileName)
    
  if (urlError) {
    console.error('Get public URL error:', urlError);
    throw urlError;
  }
  
  console.log('Successfully uploaded file, public URL:', urlData.publicUrl);
  return urlData.publicUrl
}

// Make functions available globally for non-module usage
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.getArticles = getArticles;
window.getArticleById = getArticleById;
window.getGalleryItemById = getGalleryItemById;
window.saveArticle = saveArticle;
window.deleteArticle = deleteArticle;
window.getGallery = getGallery;
window.saveGalleryItem = saveGalleryItem;
window.deleteGalleryItem = deleteGalleryItem;
window.uploadFile = uploadFile;
window.checkAdminStatus = checkAdminStatus;
window.getCurrentUserAdminStatus = getCurrentUserAdminStatus;