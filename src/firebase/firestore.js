import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './config'
import { getAuth } from 'firebase/auth'

const FAIL_MSG = 'Failed to save. Please try again.'

const ensureAdminWrite = async () => {
  const auth = getAuth()
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Access Denied')
  const userSnap = await getDoc(doc(db, 'users', uid))
  if (!userSnap.exists() || userSnap.data().role !== 'admin') throw new Error('Access Denied')
}

const ensureWrite = async (ref, expectedData = null) => {
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(FAIL_MSG)
  if (expectedData) {
    const saved = snap.data()
    const ok = Object.keys(expectedData).every((key) => {
      if (expectedData[key] === undefined) return true
      return JSON.stringify(saved[key]) === JSON.stringify(expectedData[key])
    })
    if (!ok) throw new Error(FAIL_MSG)
  }
}

const ensureDelete = async (ref) => {
  const snap = await getDoc(ref)
  if (snap.exists()) throw new Error(FAIL_MSG)
}

const ensureQueryEmpty = async (queryRef) => {
  const snap = await getDocs(queryRef)
  if (!snap.empty) throw new Error(FAIL_MSG)
}

export const getPassages = async (type) => {
  const q = query(collection(db, 'passages'), where('type', '==', type), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addPassage = async (data) => {
  await ensureAdminWrite()
  const payload = { ...data, createdAt: serverTimestamp() }
  const ref = await addDoc(collection(db, 'passages'), payload)
  await ensureWrite(ref, data)
  return { id: ref.id, ...(await getDoc(ref)).data() }
}

export const updatePassage = async (id, data) => {
  await ensureAdminWrite()
  const ref = doc(db, 'passages', id)
  await updateDoc(ref, data)
  await ensureWrite(ref, data)
}

export const deletePassage = async (id) => {
  await ensureAdminWrite()
  const ref = doc(db, 'passages', id)
  const q = query(collection(db, 'questions'), where('passageId', '==', id))
  const qs = await getDocs(q)
  await Promise.all(qs.docs.map((d) => deleteDoc(doc(db, 'questions', d.id))))
  await deleteDoc(ref)
  await ensureDelete(ref)
  await ensureQueryEmpty(q)
}

export const getQuestions = async (passageId) => {
  const q = query(collection(db, 'questions'), where('passageId', '==', passageId), orderBy('questionNumber', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addQuestion = async (data) => {
  await ensureAdminWrite()
  const ref = await addDoc(collection(db, 'questions'), data)
  await ensureWrite(ref, data)
  return { id: ref.id, ...(await getDoc(ref)).data() }
}

export const updateQuestion = async (id, data) => {
  await ensureAdminWrite()
  const ref = doc(db, 'questions', id)
  await updateDoc(ref, data)
  await ensureWrite(ref, data)
}

export const deleteQuestion = async (id) => {
  await ensureAdminWrite()
  const ref = doc(db, 'questions', id)
  await deleteDoc(ref)
  await ensureDelete(ref)
}

export const getVocabLists = async () => {
  const snap = await getDocs(collection(db, 'vocabularyLists'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addVocabList = async (data) => {
  await ensureAdminWrite()
  const payload = { ...data, createdAt: serverTimestamp() }
  const ref = await addDoc(collection(db, 'vocabularyLists'), payload)
  await ensureWrite(ref, data)
  return { id: ref.id, ...(await getDoc(ref)).data() }
}

export const updateVocabList = async (id, data) => {
  await ensureAdminWrite()
  const ref = doc(db, 'vocabularyLists', id)
  await updateDoc(ref, data)
  await ensureWrite(ref, data)
}

export const deleteVocabList = async (id) => {
  await ensureAdminWrite()
  const ref = doc(db, 'vocabularyLists', id)
  const wordsCollection = collection(db, 'vocabularyLists', id, 'words')
  const wordsSnap = await getDocs(wordsCollection)
  await Promise.all(wordsSnap.docs.map((d) => deleteDoc(doc(db, 'vocabularyLists', id, 'words', d.id))))
  await deleteDoc(ref)
  await ensureDelete(ref)
  const remainingWords = await getDocs(wordsCollection)
  if (!remainingWords.empty) throw new Error(FAIL_MSG)
}

export const getWords = async (listId) => {
  const snap = await getDocs(collection(db, 'vocabularyLists', listId, 'words'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addWord = async (listId, data) => {
  await ensureAdminWrite()
  const ref = await addDoc(collection(db, 'vocabularyLists', listId, 'words'), data)
  await ensureWrite(ref, data)
  return { id: ref.id, ...(await getDoc(ref)).data() }
}

export const updateWord = async (listId, wordId, data) => {
  await ensureAdminWrite()
  const ref = doc(db, 'vocabularyLists', listId, 'words', wordId)
  await updateDoc(ref, data)
  await ensureWrite(ref, data)
}

export const deleteWord = async (listId, wordId) => {
  await ensureAdminWrite()
  const ref = doc(db, 'vocabularyLists', listId, 'words', wordId)
  await deleteDoc(ref)
  await ensureDelete(ref)
}

export const getStudents = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'student'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const deleteStudent = async (id) => {
  await ensureAdminWrite()
  const ref = doc(db, 'users', id)
  await deleteDoc(ref)
  await ensureDelete(ref)
}
