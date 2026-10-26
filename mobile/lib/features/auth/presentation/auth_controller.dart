library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../../../core/network/api_client.dart';
import '../../../core/storage/token_store.dart';
import '../data/auth_repository.dart';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final tokenStoreProvider = Provider<TokenStore>((ref) {
  return TokenStore(ref.read(secureStorageProvider));
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    http.Client(),
    ref.read(tokenStoreProvider),
    onSessionExpired: () => ref.read(authStateProvider.notifier).signOut(),
  );
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.read(apiClientProvider),
    ref.read(tokenStoreProvider),
  );
});

final authStateProvider =
    NotifierProvider<AuthNotifier, AsyncValue<bool>>(AuthNotifier.new);

class AuthNotifier extends Notifier<AsyncValue<bool>> {
  @override
  AsyncValue<bool> build() {
    Future.microtask(() => checkAuth());
    return const AsyncValue.loading();
  }

  Future<void> checkAuth() async {
    state = const AsyncValue.loading();
    try {
      final tokenStore = ref.read(tokenStoreProvider);
      final refreshToken = await tokenStore.readRefreshToken();
      state = AsyncValue.data(refreshToken != null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      await ref.read(authRepositoryProvider).login(email, password);
      state = const AsyncValue.data(true);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> register(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      await ref.read(authRepositoryProvider).register(email, password);
      state = const AsyncValue.data(true);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> logout() async {
    state = const AsyncValue.loading();
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncValue.data(false);
  }

  void signOut() {
    state = const AsyncValue.data(false);
  }
}
