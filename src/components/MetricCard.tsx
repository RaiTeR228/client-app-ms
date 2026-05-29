import type {Metric} from "@/types/Metric";
import axios from "axios";
import React, {useEffect, useState} from "react";
import {View, Text} from "react-native";

const API_URLS_METRIC = "http://127.0.0.1:8000/api//"