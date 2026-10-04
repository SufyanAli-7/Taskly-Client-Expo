import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { colors } from '@/theme/colors';
import { useAuth } from '@/context/auth-context';
import { todoService } from '@/services/todo-service';
import TodoItem from '@/components/todos/todo-item';
import TodoFilter from '@/components/todos/todo-filter';
import TodoFormModal from '@/components/todos/todo-form-modal';
import EmptyState from '@/components/ui/empty-state';
import Input from '@/components/ui/input';

const logoSource = require('../../../assets/Glossy 3D Task List Icon.png');

export default function TodoListScreen() {
  const { user, logout } = useAuth();

  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch todos from MERN-Server
  const loadTodos = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const data = await todoService.getAllTodos();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      Alert.alert('Error', 'Failed to fetch tasks from server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTodos(true);
  }, [loadTodos]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTodos(false);
  };

  // Toggle Complete
  const handleToggle = async (todo) => {
    const previousState = [...todos];
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id
          ? { ...t, isCompleted: !t.isCompleted, status: !t.isCompleted ? 'completed' : 'active' }
          : t
      )
    );

    try {
      await todoService.toggleComplete(todo.id, todo.isCompleted, todo);
    } catch (error) {
      console.error('Error toggling todo:', error);
      Alert.alert('Error', 'Could not update task status.');
      setTodos(previousState);
    }
  };

  // Delete Todo
  const handleDelete = async (id) => {
    const previousState = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await todoService.deleteTodo(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      Alert.alert('Error', 'Could not delete task.');
      setTodos(previousState);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (todo) => {
    setSelectedTodo(todo);
    setModalVisible(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedTodo(null);
    setModalVisible(true);
  };

  // Submit Modal (Create or Edit)
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      if (formData.id) {
        // Edit existing
        const res = await todoService.updateTodo(formData);
        if (res?.todo) {
          setTodos((prev) =>
            prev.map((t) => (t.id === formData.id ? res.todo : t))
          );
        }
      } else {
        // Create new
        const res = await todoService.createTodo(formData);
        if (res?.todo) {
          setTodos((prev) => [res.todo, ...prev]);
        }
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving todo:', error);
      const msg = error.response?.data?.message || 'Failed to save task.';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout Confirmation
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  // Computed counts
  const counts = useMemo(() => {
    const active = todos.filter((t) => !t.isCompleted).length;
    const completed = todos.filter((t) => t.isCompleted).length;
    return {
      all: todos.length,
      active,
      completed,
    };
  }, [todos]);

  // Filtered todos based on active tab and search query
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Tab filter
      if (activeFilter === 'active' && todo.isCompleted) return false;
      if (activeFilter === 'completed' && !todo.isCompleted) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (todo.title || '').toLowerCase().includes(query);
        const matchDesc = (todo.description || '').toLowerCase().includes(query);
        return matchTitle || matchDesc;
      }

      return true;
    });
  }, [todos, activeFilter, searchQuery]);

  // Progress percentage
  const progressPercent = counts.all > 0 ? Math.round((counts.completed / counts.all) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image source={logoSource} style={styles.headerLogo} contentFit="contain" />
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.fullName?.split(' ')[0] || 'there'} 👋
            </Text>
            <Text style={styles.brandTitle}>Taskly</Text>
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          hitSlop={10}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Main Content / FlatList */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id || item._id}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Analytics Progress Card */}
              <View style={styles.statsCard}>
                <View style={styles.statsTopRow}>
                  <View>
                    <Text style={styles.statsSubtitle}>Productivity</Text>
                    <Text style={styles.statsTitle}>
                      {counts.completed} of {counts.all} tasks completed
                    </Text>
                  </View>
                  <View style={styles.percentBadge}>
                    <Text style={styles.percentText}>{progressPercent}%</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Search Bar with Instant Clear Button */}
              <Input
                placeholder="Search tasks by title..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon="search-outline"
                onClear={() => setSearchQuery('')}
                containerStyle={styles.searchContainer}
                returnKeyType="search"
              />

              {/* Active Search Status Feedback */}
              {searchQuery ? (
                <View style={styles.searchStatusRow}>
                  <Text style={styles.searchStatusText} numberOfLines={1}>
                    Found {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'} for "{searchQuery}"
                  </Text>
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    hitSlop={10}
                    style={styles.clearSearchBtn}
                  >
                    <Ionicons name="close-circle" size={15} color={colors.primary} />
                    <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Filter Tabs */}
              <TodoFilter
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
                counts={counts}
              />
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title={
                searchQuery
                  ? `No tasks matching "${searchQuery}"`
                  : activeFilter === 'completed'
                  ? 'No completed tasks yet'
                  : 'No tasks on your list'
              }
              subtitle={
                searchQuery
                  ? 'Tap below to clear search and see all your tasks.'
                  : activeFilter === 'completed'
                  ? 'Complete active tasks to see them here.'
                  : 'Tap the "+" button below to add your first task.'
              }
              actionTitle={
                searchQuery
                  ? 'Clear Search & View All'
                  : activeFilter === 'all'
                  ? 'Add Task'
                  : undefined
              }
              onAction={
                searchQuery
                  ? () => setSearchQuery('')
                  : activeFilter === 'all'
                  ? handleOpenCreate
                  : undefined
              }
            />
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Pressable
          onPress={handleOpenCreate}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <Ionicons name="add" size={30} color={colors.textInverse} />
        </Pressable>
      </View>

      {/* Create / Edit Modal Form */}
      <TodoFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitForm}
        initialData={selectedTodo}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  greeting: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceVariant,
  },
  logoutPressed: {
    backgroundColor: '#E2E8F0',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120, // Leave room for FAB
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  statsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statsSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  percentBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  searchStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  clearSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
  },
  clearSearchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 9999,
    elevation: 12,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  fabPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.95 }],
  },
});
