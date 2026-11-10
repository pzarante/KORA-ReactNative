import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import AuthSurface from "@/src/features/auth/presentation/components/AuthSurface";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project, ProjectComment } from "../../domain/entities/Project";
import { Initial, Message, ProjectSummary, timeAgo, TopBar, useFocusLoad, useProjectDS } from "../components/feed";
import { colors, ui } from "../components/projectUi";

export default function CommentsScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const ds = useProjectDS();
  const { isLoggedIn, profile } = useAuth();
  const { data: comments, error, reload } = useFocusLoad(() => ds.listComments(project.id), [ds, project.id]);
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [replyTo, setReplyTo] = useState<ProjectComment | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const author = isLoggedIn ? profile.nombreCompleto || "Usuario" : guestName.trim();
  const canSend = !!text.trim() && !!author && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setSendError(null);
    try {
      await ds.addComment({ proyectoId: project.id, texto: text.trim(), respuestaA: replyTo?.id ?? null, autorNombre: author });
      // A reply to the creator's own comment only sends them the "respondió" notification.
      const repliedTo = replyTo?.autorId ?? null;
      if (repliedTo) void ds.notify({ para: [repliedTo], tipo: "respuesta_comentario", proyectoId: project.id, actorNombre: author });
      if (project.creadorId !== repliedTo) void ds.notify({ para: [project.creadorId], tipo: "comentario", proyectoId: project.id, actorNombre: author });
      setText("");
      setReplyTo(null);
      reload();
    } catch (err: any) {
      setSendError(err?.message ?? "No se pudo publicar el comentario");
    } finally {
      setSending(false);
    }
  };

  const roots = (comments ?? []).filter((c) => !c.respuestaA);
  const repliesOf = (id: string) => (comments ?? []).filter((c) => c.respuestaA === id);

  const renderComment = (comment: ProjectComment, reply = false) => (
    <View key={comment.id} style={[styles.comment, reply && styles.reply]}>
      <Initial name={comment.autorNombre} size={reply ? 40 : 46} />
      <View style={styles.flex}>
        <View style={styles.commentHeader}>
          <Text style={styles.author}>{comment.autorNombre}</Text>
          {comment.autorId && comment.autorId === project.creadorId ? (
            <View style={[ui.chip, styles.creator]}>
              <MaterialCommunityIcons name="crown-outline" size={14} color={colors.primary} />
              <Text style={[ui.chipText, styles.creatorText]}>Creador</Text>
            </View>
          ) : null}
          <Text style={styles.time}>{timeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.texto}</Text>
        {!reply ? (
          <TouchableOpacity onPress={() => setReplyTo(comment)} style={styles.replyButton}>
            <MaterialCommunityIcons name="subdirectory-arrow-right" size={18} color={colors.primary} />
            <Text style={styles.replyText}>Responder</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <AuthSurface>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TopBar onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.content} testID="comments-screen">
          <Text style={styles.title}>Comentarios</Text>
          <Text style={styles.subtitle}>Comparte tus ideas, preguntas o sugerencias con la comunidad</Text>
          <ProjectSummary project={project} />
          {error ? <Message text={error} /> : null}
          {comments && roots.length === 0 ? <Message text="Sé la primera persona en comentar." /> : null}
          {roots.map((comment) => (
            <View key={comment.id} style={styles.thread}>
              {renderComment(comment)}
              {repliesOf(comment.id).map((reply) => renderComment(reply, true))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          {replyTo ? (
            <View style={styles.replying}>
              <Text style={styles.replyingText} numberOfLines={1}>Respondiendo a {replyTo.autorNombre}</Text>
              <TouchableOpacity accessibilityLabel="Cancelar respuesta" onPress={() => setReplyTo(null)}>
                <MaterialCommunityIcons name="close" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : null}
          {!isLoggedIn ? (
            <TextInput
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.muted}
              style={[ui.input, styles.nameInput]}
              testID="comment-name-input"
            />
          ) : null}
          {sendError ? <Text style={styles.sendError}>{sendError}</Text> : null}
          <View style={styles.inputRow}>
            <Initial name={author || "?"} />
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escribe un comentario..."
              placeholderTextColor={colors.muted}
              style={[ui.input, styles.flex]}
              multiline
              testID="comment-input"
            />
            <TouchableOpacity
              accessibilityLabel="Enviar comentario"
              disabled={!canSend}
              onPress={send}
              style={[styles.send, !canSend && styles.sendDisabled]}
              testID="comment-send-button"
            >
              <MaterialCommunityIcons name="send-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 24, gap: 16 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center", marginTop: 12 },
  subtitle: { color: colors.text, fontSize: 15, textAlign: "center" },
  thread: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12, gap: 10 },
  comment: { flexDirection: "row", gap: 12 },
  reply: { marginLeft: 36, padding: 12, borderRadius: 20, backgroundColor: colors.soft },
  commentHeader: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  author: { color: colors.text, fontSize: 16, fontWeight: "800" },
  creator: { paddingHorizontal: 8, paddingVertical: 3 },
  creatorText: { fontSize: 12 },
  time: { color: colors.muted, fontSize: 13, marginLeft: "auto" },
  text: { color: colors.text, fontSize: 15, lineHeight: 21, marginTop: 4 },
  replyButton: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  replyText: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  composer: { gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  replying: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.soft, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  replyingText: { flex: 1, color: colors.primary, fontWeight: "700" },
  nameInput: { minHeight: 44 },
  sendError: { color: colors.error, fontSize: 13 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  send: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  sendDisabled: { opacity: 0.4 },
});
